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
import { ordersService } from '../../features/orders/ordersService'
import { cartsAdminService } from '../../features/carts/cartsAdminService'
import { blogsService, blogCategoriesService, blogTagsService } from '../../features/blogs/blogsService'
import { faqsService } from '../../features/faqs/faqsService'
import { servicesService } from '../../features/services/servicesService'
import { pricingService } from '../../features/services/pricingService'
import { storeProductsService } from '../../features/storeProducts/storeProductsService'
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
        <Text type="secondary" style={{ fontSize: 12, letterSpacing: 1 }}>LOSA247 ADMIN</Text>
        <Title level={3} style={{ margin: 0 }}>{title}</Title>
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
  const query = useApiQuery(
    () => logsService.getLogs({ page, limit: pageSize, search: debounced || undefined }),
    [page, debounced],
  )
  const rows = query.data?.items || []

  const exportCsv = async () => {
    try { const blob = await logsService.exportLogs({}); downloadBlob(blob, 'logs.csv'); message.success('Đã xuất CSV') }
    catch { message.error('Backend chưa hỗ trợ logs export') }
  }
  const columns = [
    { title: 'Thời gian', dataIndex: 'createdAt', key: 'createdAt', render: (v) => formatDate(v, true) },
    { title: 'Người thực hiện', dataIndex: ['actor', 'name'], key: 'actor', render: (v, r) => v || r.actor || '—' },
    { title: 'Hành động', dataIndex: 'action', key: 'action' },
    { title: 'Module', dataIndex: 'module', key: 'module' },
    { title: 'IP', dataIndex: 'ip', key: 'ip' },
  ]
  return (
    <>
      <PageHeader title="Nhật ký hệ thống" extra={
        <Space wrap>
          <Input.Search allowClear placeholder="Tìm hành động / người" value={search} onChange={(e) => onSearch(e.target.value)} style={{ width: 240 }} />
          <Button icon={<DownloadOutlined />} onClick={exportCsv}>Xuất CSV</Button>
        </Space>} />
      {query.error && <Alert type="warning" showIcon title="Backend chưa có endpoint /admin/logs (xem API_ADDITIONS.md)" style={{ marginBottom: 12 }} />}
      <Table rowKey={(r) => r._id || r.id || Math.random()} loading={query.loading} columns={columns} dataSource={rows}
        pagination={{ current: page, pageSize, total: query.data?.pagination?.total || 0, onChange: setPage }} />
    </>
  )
}

// ---- Users & permissions --------------------------------------------------
