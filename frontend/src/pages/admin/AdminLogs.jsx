import { useMemo, useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import EmojiPicker from 'emoji-picker-react'
import {
  Alert, App, Button, Card, Col, Descriptions, Drawer, Empty, Form, Input, InputNumber, List,
  Modal, Popconfirm, Row, Segmented, Select, Space, Spin, Statistic, Steps, Switch, Table, Tabs,
  Tag, Timeline, Typography, Upload, Dropdown, DatePicker,
} from 'antd'
import { Editor } from '@tinymce/tinymce-react'
import {
  DownloadOutlined, PlusOutlined, ReloadOutlined, SettingOutlined, UploadOutlined, LikeOutlined, DislikeOutlined, CloseOutlined,
  FileTextOutlined, CheckCircleOutlined, ClockCircleOutlined, EyeOutlined, SmileOutlined, PictureOutlined, PaperClipOutlined
} from '@ant-design/icons'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid } from 'recharts'
import { useApiQuery } from '../../hooks/useApiQuery'
import { useDebounce } from '../../hooks/useDebounce'
import { useListParams } from '../../hooks/useListParams'
import { formatCurrency, formatDate } from '../../utils/format'
import { downloadBlob } from '../../utils/downloadBlob'
import { ORDER_STATUS, LEAD_STATUS, BLOG_STATUS, CHAT_MODE, ORDER_STEPS } from '../../constants/statusConfig'
import { dashboardService } from '../../features/dashboard/dashboardService'
import { leadsService } from '../../features/leads/leadsService'
import { blogsService, blogCategoriesService, blogTagsService } from '../../features/blogs/blogsService'
import { faqsService } from '../../features/faqs/faqsService'
import { servicesService } from '../../features/services/servicesService'
import { pricingService } from '../../features/services/pricingService'
import { chatService } from '../../features/chat/chatService'
import { logsService } from '../../features/logs/logsService'
import { usersService, rolesService } from '../../features/users/usersService'
import { settingsService, apiConfigsService } from '../../features/settings/settingsService'
import { useChatSocket } from '../../features/chat/useChatSocket'
import dayjs from 'dayjs'

const { Title, Text } = Typography

// ---- Reusable bits --------------------------------------------------------
function PageHeader({ title, extra }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, gap: 16, flexWrap: 'wrap' }}>
      <div>
        <Title level={3} className="admin-page-title">{title}</Title>
      </div>
      <Space wrap>{extra}</Space>
    </div>
  )
}

function StatusTag({ map, value }) {
  const cfg = map[value] || { label: value || '—', color: 'default' }
  return <Tag color={cfg.color}>{cfg.label}</Tag>
}

// Bọc trạng thái loading/error/empty cho các khối dữ liệu.
function QueryState({ loading, error, empty, children }) {
  if (loading) return <div style={{ padding: 48, textAlign: 'center' }}><Spin /></div>
  if (error) return <Alert type="error" showIcon title={error} style={{ margin: '12px 0' }} />
  if (empty) return <Empty description="Chưa có dữ liệu" style={{ padding: 32 }} />
  return children
}

// ---- Dashboard ------------------------------------------------------------

export function AdminLogs() {
  const { message } = App.useApp()
  const { search, onSearch, debounced, page, setPage, pageSize } = useListParams()
  const [openPayload, setOpenPayload] = useState(false)
  const [selectedLog, setSelectedLog] = useState(null)

  const query = useApiQuery(
    () => logsService.getLogs({ page, limit: pageSize, search: debounced || undefined }),
    [page, debounced],
  )
  const rows = query.data?.items || []

  const viewPayload = (log) => {
    setSelectedLog(log)
    setOpenPayload(true)
  }

  const exportCsv = async () => {
    try { const blob = await logsService.exportLogs({}); downloadBlob(blob, 'logs.csv'); message.success('Đã xuất CSV') }
    catch { message.error('Backend chưa hỗ trợ logs export') }
  }
  const columns = [
    { title: 'Thời gian', dataIndex: 'createdAt', key: 'createdAt', width: 180, render: (v) => formatDate(v, true) },
    { title: 'Người thực hiện', dataIndex: ['actor', 'name'], key: 'actor', width: 210, ellipsis: true, render: (v, r) => v || r.actor || '—' },
    {
      title: 'Hành động',
      dataIndex: 'action',
      key: 'action',
      width: 130,
      render: (v) => {
        let color = 'default'
        if (v === 'CREATE') color = 'green'
        if (v === 'UPDATE') color = 'blue'
        if (v === 'DELETE') color = 'red'
        return <Tag color={color}>{v}</Tag>
      }
    },
    { title: 'Module', dataIndex: 'module', key: 'module', width: 160, ellipsis: true },
    { title: 'IP', dataIndex: 'ip', key: 'ip', width: 150 },
    {
      title: 'Chi tiết',
      key: 'detail',
      width: 90,
      fixed: 'right',
      render: (_, r) => (
        <Button size="small" type="link" onClick={() => viewPayload(r)} disabled={!r.payload}>
          Xem
        </Button>
      )
    }
  ]
  return (
    <>
      <div className="logs-page-header">
        <PageHeader title="Nhật ký hệ thống" extra={
          <Space wrap className="logs-header-actions">
            <Input.Search allowClear placeholder="Tìm hành động / người" value={search} onChange={(e) => onSearch(e.target.value)} />
            <Button icon={<DownloadOutlined />} onClick={exportCsv}>Xuất CSV</Button>
          </Space>} />
      </div>
      <div className="logs-table-card">
        <Table
          className="logs-table"
          rowKey={(r) => r._id || r.id}
          loading={query.loading}
          columns={columns}
          dataSource={rows}
          scroll={{ x: 920 }}
          pagination={{ current: page, pageSize, total: query.data?.pagination?.total || 0, onChange: setPage, showSizeChanger: false }}
        />
      </div>

      <Drawer
        className="logs-detail-drawer"
        title="Chi tiết Log"
        placement="right"
        width={500}
        onClose={() => setOpenPayload(false)}
        open={openPayload}
      >
        {selectedLog && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Thời gian">{formatDate(selectedLog.createdAt, true)}</Descriptions.Item>
              <Descriptions.Item label="Người thực hiện">{selectedLog.actor?.name || '—'}</Descriptions.Item>
              <Descriptions.Item label="Hành động"><Tag color="blue">{selectedLog.action}</Tag></Descriptions.Item>
              <Descriptions.Item label="Module">{selectedLog.module}</Descriptions.Item>
              <Descriptions.Item label="IP">{selectedLog.ip}</Descriptions.Item>
            </Descriptions>

            {selectedLog.payload ? (
              <Card size="small" title="Payload Data" style={{ marginTop: 16 }}>
                <pre style={{ background: '#f8fafc', padding: 12, borderRadius: 8, overflowX: 'auto', margin: 0, fontSize: 13 }}>
                  {JSON.stringify(selectedLog.payload, null, 2)}
                </pre>
              </Card>
            ) : (
              <Empty description="Không có payload" style={{ marginTop: 24 }} />
            )}
          </div>
        )}
      </Drawer>
    </>
  )
}

// ---- Users & permissions --------------------------------------------------
