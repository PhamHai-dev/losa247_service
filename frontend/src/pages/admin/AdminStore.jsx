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

export function AdminStore() {
  return (
    <>
      <PageHeader title="Gian hàng workflow" />
      <StoreProductsTable />
    </>
  )
}

function StoreProductsTable() {
  const { message } = App.useApp()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form] = Form.useForm()
  const { search, onSearch, debounced, page, setPage, pageSize } = useListParams()
  const query = useApiQuery(
    () => storeProductsService.getStoreProducts({ search: debounced || undefined, page, limit: pageSize }),
    [debounced, page],
  )
  const rows = query.data?.items || []
  const total = query.data?.pagination?.total || 0

  const openModal = (row) => { setEditing(row || null); setOpen(true) }
  const submit = async () => {
    const values = await form.validateFields()
    // Validate JSON workflow trước khi submit (theo Agent.md 3.7).
    if (values.n8nWorkflowJson) {
      try { JSON.parse(values.n8nWorkflowJson) } catch { message.error('n8nWorkflowJson không phải JSON hợp lệ'); return }
    }
    try {
      if (editing?._id) await storeProductsService.updateProduct(editing._id, values)
      else await storeProductsService.createProduct(values)
      message.success('Đã lưu sản phẩm'); setOpen(false); query.refetch()
    } catch { message.error('Không lưu được sản phẩm') }
  }
  const remove = async (row) => { try { await storeProductsService.deleteProduct(row._id); message.success('Đã xoá'); query.refetch() } catch { message.error('Không xoá được') } }

  const columns = [
    { title: 'Tên', dataIndex: 'name', key: 'name', render: (v) => <span className="cell-strong">{v}</span> },
    { title: 'Nền tảng', dataIndex: 'platform', key: 'platform' },
    { title: 'Giá', dataIndex: 'price', key: 'price', render: (v) => formatCurrency(v) },
    {
      title: '', key: 'action', render: (_, r) => (
        <Space><Button size="small" onClick={() => openModal(r)}>Sửa</Button><Popconfirm title="Xoá?" onConfirm={() => remove(r)}><Button size="small" danger>Xoá</Button></Popconfirm></Space>
      )
    },
  ]
  return (
    <>
      <Space style={{ marginBottom: 12 }} wrap>
        <Input.Search allowClear placeholder="Tìm tên sản phẩm" value={search} onChange={(e) => onSearch(e.target.value)} style={{ width: 240 }} />
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal(null)}>Thêm sản phẩm</Button>
      </Space>
      <Table rowKey="_id" loading={query.loading} columns={columns} dataSource={rows}
        pagination={{ current: page, pageSize, total, onChange: setPage, showSizeChanger: false }} />
      <Modal title={editing ? 'Sửa sản phẩm' : 'Thêm sản phẩm'} open={open} onOk={submit} onCancel={() => setOpen(false)} destroyOnHidden width={640}>
        <Form form={form} layout="vertical" key={editing?._id || 'new'} initialValues={editing || { name: '', price: 0, platform: '', n8nWorkflowJson: '' }}>
          <Form.Item name="name" label="Tên" rules={[{ required: true, message: 'Nhập tên' }]}><Input /></Form.Item>
          <Form.Item name="platform" label="Nền tảng"><Input placeholder="Facebook / Zalo / Shopee..." /></Form.Item>
          <Form.Item name="price" label="Giá" rules={[{ required: true, message: 'Nhập giá' }]}><InputNumber style={{ width: '100%' }} min={0} /></Form.Item>
          <Form.Item name="description" label="Mô tả"><Input.TextArea rows={2} /></Form.Item>
          <Form.Item name="n8nWorkflowJson" label="n8n Workflow JSON"><Input.TextArea rows={6} placeholder='{ "nodes": [] }' /></Form.Item>
        </Form>
      </Modal>
    </>
  )
}

// ---- Chat center ----------------------------------------------------------
