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

export function AdminOrders() {
  const [statusTab, setStatusTab] = useState('all')
  const [detailId, setDetailId] = useState(null)
  const { search, onSearch, debounced, page, setPage, pageSize } = useListParams()

  const status = statusTab === 'all' ? undefined : statusTab
  const query = useApiQuery(
    () => ordersService.getOrders({ page, limit: pageSize, status, search: debounced || undefined }),
    [page, status, debounced],
  )
  const rows = query.data?.items || []
  const total = query.data?.pagination?.total || 0

  const columns = [
    { title: 'Mã đơn', dataIndex: 'code', key: 'code', render: (v) => <span className="cell-strong">{v}</span> },
    { title: 'Khách hàng', dataIndex: ['customer', 'name'], key: 'customer' },
    { title: 'SĐT', dataIndex: ['customer', 'phone'], key: 'phone' },
    { title: 'Tổng tiền', dataIndex: 'total', key: 'total', render: (v) => formatCurrency(v) },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: (v) => <StatusTag map={ORDER_STATUS} value={v} /> },
    { title: 'Ngày tạo', dataIndex: 'createdAt', key: 'createdAt', render: (v) => formatDate(v) },
    { title: '', key: 'action', render: (_, r) => <Button size="small" onClick={() => setDetailId(r._id)}>Chi tiết</Button> },
  ]

  const tabItems = [{ key: 'all', label: 'Tất cả' }, ...Object.entries(ORDER_STATUS).map(([k, v]) => ({ key: k, label: v.label }))]

  return (
    <>
      <PageHeader title="Quản lý Đơn hàng"
        extra={<Input.Search allowClear placeholder="Tìm mã đơn / tên / SĐT" value={search} onChange={(e) => onSearch(e.target.value)} style={{ width: 280 }} />} />
      <Tabs activeKey={statusTab} onChange={(k) => { setStatusTab(k); setPage(1) }} items={tabItems} />
      {query.error && <Alert type="error" showIcon title={query.error} style={{ marginBottom: 12 }} />}
      <Table rowKey="_id" loading={query.loading} columns={columns} dataSource={rows}
        pagination={{ current: page, pageSize, total, onChange: setPage, showSizeChanger: false }} />
      <OrderDetailDrawer id={detailId} open={!!detailId} onClose={() => setDetailId(null)} onChanged={query.refetch} />
    </>
  )
}

function OrderDetailDrawer({ id, open, onClose, onChanged }) {
  const { message, modal } = App.useApp()
  const query = useApiQuery(() => ordersService.getOrderById(id), [id], { enabled: !!id })
  const order = query.data

  const act = async (fn, okMsg) => {
    try { await fn(); message.success(okMsg); query.refetch(); onChanged?.() }
    catch (e) { message.error(e?.error?.message || 'Thao tác thất bại') }
  }
  const cancel = () => {
    let reason = ''
    modal.confirm({
      title: 'Huỷ đơn hàng',
      content: <Input placeholder="Lý do huỷ" onChange={(e) => { reason = e.target.value }} />,
      onOk: () => act(() => ordersService.cancel(id, reason), 'Đã huỷ đơn'),
    })
  }

  const stepIndex = order ? ORDER_STEPS.indexOf(order.status) : -1

  return (
    <Drawer title={order ? `Đơn ${order.code}` : 'Chi tiết đơn'} size={520} open={open} onClose={onClose}>
      <QueryState loading={query.loading} error={query.error} empty={!order}>
        {order && (
          <>
            {order.status !== 'cancelled' && stepIndex >= 0 && (
              <Steps size="small" current={stepIndex} style={{ marginBottom: 20 }}
                items={ORDER_STEPS.map((s) => ({ title: ORDER_STATUS[s].label }))} />
            )}
            <Descriptions column={1} bordered size="small"
              items={[
                { key: 'name', label: 'Khách hàng', children: order.customer?.name },
                { key: 'phone', label: 'SĐT', children: order.customer?.phone },
                { key: 'email', label: 'Email', children: order.customer?.email || '—' },
                { key: 'method', label: 'Thanh toán', children: order.paymentMethod },
                { key: 'status', label: 'Trạng thái', children: <StatusTag map={ORDER_STATUS} value={order.status} /> },
                { key: 'total', label: 'Tổng tiền', children: formatCurrency(order.total) },
              ]} />
            <Title level={5} style={{ marginTop: 20 }}>Sản phẩm</Title>
            <List size="small" dataSource={order.items || []}
              renderItem={(it) => <List.Item>{it.name} × {it.qty} <Text type="secondary">{formatCurrency(it.price)}</Text></List.Item>} />
            <Space wrap style={{ marginTop: 20 }}>
              {order.status === 'pending' && <Button type="primary" onClick={() => act(() => ordersService.confirmPayment(id), 'Đã xác nhận thanh toán')}>Xác nhận thanh toán</Button>}
              {order.status === 'paid' && <Button type="primary" onClick={() => act(() => ordersService.activate(id), 'Đã kích hoạt dịch vụ')}>Kích hoạt dịch vụ</Button>}
              {!['completed', 'cancelled'].includes(order.status) && <Button danger onClick={cancel}>Huỷ đơn</Button>}
            </Space>
          </>
        )}
      </QueryState>
    </Drawer>
  )
}

// ---- Abandoned carts (đưa vào tab riêng dưới Orders menu nếu cần) ---------
