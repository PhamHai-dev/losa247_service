import { useMemo, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Alert, App, Button, Card, Col, Descriptions, Drawer, Empty, Form, Input, InputNumber, List,
  Modal, Popconfirm, Row, Segmented, Select, Space, Spin, Statistic, Steps, Switch, Table, Tabs,
  Tag, Timeline, Typography, Upload,
} from 'antd'
import {
  DownloadOutlined, PlusOutlined, ReloadOutlined, UploadOutlined, LikeOutlined, DislikeOutlined,
} from '@ant-design/icons'
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
import { blogsService } from '../../features/blogs/blogsService'
import { faqsService } from '../../features/faqs/faqsService'
import { servicesService } from '../../features/services/servicesService'
import { storeProductsService } from '../../features/storeProducts/storeProductsService'
import { chatService } from '../../features/chat/chatService'
import { logsService } from '../../features/logs/logsService'
import { usersService, rolesService } from '../../features/users/usersService'
import { settingsService, apiConfigsService } from '../../features/settings/settingsService'
import { useChatSocket } from '../../features/chat/useChatSocket'

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
export function AdminDashboard() {
  const kpisQ = useApiQuery(() => dashboardService.getKpis(), [])
  const revenueQ = useApiQuery(() => dashboardService.getRevenueChart('30d'), [])
  const sourcesQ = useApiQuery(() => dashboardService.getLeadSources(), [])

  const kpi = kpisQ.data?.data || {}
  const revenue = revenueQ.data?.data || []
  const sources = sourcesQ.data?.data || []
  const maxRevenue = Math.max(1, ...revenue.map((r) => r.revenue || 0))

  return (
    <>
      <PageHeader
        title="Dashboard tổng quan"
        extra={<Button icon={<ReloadOutlined />} onClick={() => { kpisQ.refetch(); revenueQ.refetch(); sourcesQ.refetch() }}>Làm mới</Button>}
      />
      <Spin spinning={kpisQ.loading}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={8}><Card><Statistic title="Lead mới trong tháng" value={kpi.newLeads ?? 0} prefix="⚡" /></Card></Col>
          <Col xs={24} sm={12} lg={8}><Card><Statistic title="Tổng đơn hàng" value={kpi.totalOrders ?? 0} prefix="🧾" /></Card></Col>
          <Col xs={24} sm={12} lg={8}><Card><Statistic title="Doanh thu" value={kpi.totalRevenue ?? 0} suffix="đ" groupSeparator="." /></Card></Col>
        </Row>
      </Spin>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={16}>
          <Card title="Doanh thu 30 ngày">
            <QueryState loading={revenueQ.loading} error={revenueQ.error} empty={!revenue.length}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 220 }}>
                {revenue.map((r) => (
                  <div key={r._id} title={`${r._id}: ${formatCurrency(r.revenue)}`}
                    style={{ flex: 1, minWidth: 6, height: `${Math.round(((r.revenue || 0) / maxRevenue) * 100)}%`, background: 'linear-gradient(180deg,#0F766E,#14b8a6)', borderRadius: 6 }} />
                ))}
              </div>
            </QueryState>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Nguồn Lead">
            <QueryState loading={sourcesQ.loading} error={sourcesQ.error} empty={!sources.length}>
              <List
                dataSource={sources}
                renderItem={(s) => (
                  <List.Item>
                    <span>{s._id || 'Không rõ'}</span>
                    <Tag color="cyan">{s.count}</Tag>
                  </List.Item>
                )}
              />
            </QueryState>
          </Card>
        </Col>
      </Row>
    </>
  )
}

// ---- Leads ----------------------------------------------------------------
export function AdminLeads() {
  const { message } = App.useApp()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState()
  const [page, setPage] = useState(1)
  const [detailId, setDetailId] = useState(null)
  const debounced = useDebounce(search, 300)

  const query = useApiQuery(
    () => leadsService.getLeads({ page, limit: 20, search: debounced || undefined, status }),
    [page, debounced, status],
  )
  const rows = query.data?.items || []
  const total = query.data?.pagination?.total || 0

  const handleExport = async () => {
    try {
      const blob = await leadsService.exportLeads({ search: debounced || undefined, status })
      downloadBlob(blob, 'leads.xlsx')
      message.success('Đã xuất danh sách lead')
    } catch {
      message.error('Không xuất được (backend chưa hỗ trợ export?)')
    }
  }

  const columns = [
    { title: 'Tên', dataIndex: 'name', key: 'name', render: (v) => <span className="cell-strong">{v}</span> },
    { title: 'SĐT', dataIndex: 'phone', key: 'phone' },
    { title: 'Nguồn', dataIndex: 'source', key: 'source' },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: (v) => <StatusTag map={LEAD_STATUS} value={v} /> },
    { title: 'Ngày tạo', dataIndex: 'createdAt', key: 'createdAt', render: (v) => formatDate(v) },
    { title: '', key: 'action', render: (_, r) => <Button size="small" onClick={() => setDetailId(r._id)}>Chi tiết</Button> },
  ]

  return (
    <>
      <PageHeader title="Quản lý Lead" extra={<Button icon={<DownloadOutlined />} onClick={handleExport}>Xuất Excel</Button>} />
      <Space style={{ marginBottom: 16 }} wrap>
        <Input.Search allowClear placeholder="Tìm tên / SĐT" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} style={{ width: 260 }} />
        <Select allowClear placeholder="Trạng thái" style={{ width: 180 }} value={status} onChange={(v) => { setStatus(v); setPage(1) }}
          options={Object.entries(LEAD_STATUS).map(([value, cfg]) => ({ value, label: cfg.label }))} />
      </Space>
      {query.error && <Alert type="error" showIcon title={query.error} style={{ marginBottom: 12 }} />}
      <Table rowKey="_id" loading={query.loading} columns={columns} dataSource={rows}
        pagination={{ current: page, pageSize: 20, total, onChange: setPage, showSizeChanger: false }} />
      <LeadDetailDrawer id={detailId} open={!!detailId} onClose={() => setDetailId(null)} onChanged={query.refetch} />
    </>
  )
}

function LeadDetailDrawer({ id, open, onClose, onChanged }) {
  const { message } = App.useApp()
  const [note, setNote] = useState('')
  const query = useApiQuery(() => leadsService.getLeadById(id), [id], { enabled: !!id })
  const lead = query.data

  const addNote = async () => {
    if (!note.trim()) return
    try {
      await leadsService.addNote(id, note)
      setNote('')
      message.success('Đã thêm ghi chú')
      query.refetch()
    } catch { message.error('Không thêm được ghi chú') }
  }
  const convert = async () => {
    try {
      await leadsService.convertToOrder(id)
      message.success('Đã chuyển lead thành đơn hàng')
      onChanged?.()
      onClose()
    } catch { message.error('Không chuyển được đơn hàng') }
  }

  return (
    <Drawer title="Chi tiết Lead" size={480} open={open} onClose={onClose}
      extra={<Popconfirm title="Chuyển lead này thành đơn hàng?" onConfirm={convert}><Button type="primary">Chuyển thành đơn</Button></Popconfirm>}>
      <QueryState loading={query.loading} error={query.error} empty={!lead}>
        {lead && (
          <>
            <Descriptions column={1} bordered size="small"
              items={[
                { key: 'name', label: 'Tên', children: lead.name },
                { key: 'phone', label: 'SĐT', children: lead.phone },
                { key: 'source', label: 'Nguồn', children: lead.source },
                { key: 'status', label: 'Trạng thái', children: <StatusTag map={LEAD_STATUS} value={lead.status} /> },
                { key: 'createdAt', label: 'Ngày tạo', children: formatDate(lead.createdAt, true) },
              ]} />
            <Title level={5} style={{ marginTop: 20 }}>Ghi chú</Title>
            <Timeline items={(lead.notes || []).map((n, i) => ({ key: i, children: <><div>{n.content || n.text || String(n)}</div>{n.createdAt && <Text type="secondary" style={{ fontSize: 12 }}>{formatDate(n.createdAt, true)}</Text>}</> }))} />
            <Space.Compact style={{ width: '100%', marginTop: 8 }}>
              <Input placeholder="Thêm ghi chú chăm sóc..." value={note} onChange={(e) => setNote(e.target.value)} onPressEnter={addNote} />
              <Button type="primary" onClick={addNote}>Lưu</Button>
            </Space.Compact>
          </>
        )}
      </QueryState>
    </Drawer>
  )
}

// ---- Orders ---------------------------------------------------------------
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
export function AdminCarts() {
  const { message } = App.useApp()
  const [page, setPage] = useState(1)
  const query = useApiQuery(() => cartsAdminService.getAbandoned({ page, limit: 20 }), [page])
  const rows = query.data?.items || []

  const remind = async (recordId) => {
    try { await cartsAdminService.remind(recordId); message.success('Đã gửi nhắc nhở') }
    catch { message.error('Không gửi được nhắc nhở') }
  }
  const columns = [
    { title: 'Khách', dataIndex: ['userId', 'name'], key: 'user', render: (v, r) => v || r.userId || '—' },
    { title: 'Số lượng', dataIndex: 'qty', key: 'qty' },
    { title: 'Thêm lúc', dataIndex: 'addedAt', key: 'addedAt', render: (v) => formatDate(v, true) },
    { title: '', key: 'action', render: (_, r) => <Button size="small" onClick={() => remind(r._id)}>Nhắc nhở</Button> },
  ]
  return (
    <>
      <PageHeader title="Giỏ hàng treo" />
      <Table rowKey="_id" loading={query.loading} columns={columns} dataSource={rows}
        pagination={{ current: page, pageSize: 20, total: query.data?.pagination?.total || 0, onChange: setPage }} />
    </>
  )
}

// ---- Blogs ----------------------------------------------------------------
export function AdminBlogs() {
  const { message } = App.useApp()
  const navigate = useNavigate()
  const [tab, setTab] = useState('all')
  const { search, onSearch, debounced, page, setPage, pageSize } = useListParams()
  const status = tab === 'all' ? undefined : tab
  const query = useApiQuery(
    () => blogsService.getBlogs({ status, search: debounced || undefined, page, limit: pageSize }),
    [status, debounced, page],
  )
  const rows = query.data?.items || []
  const total = query.data?.pagination?.total || 0

  const doAction = async (fn, msg) => {
    try { await fn(); message.success(msg); query.refetch() } catch { message.error('Thao tác thất bại') }
  }

  const columns = [
    { title: 'Tiêu đề', dataIndex: 'title', key: 'title', render: (v) => <span className="cell-strong">{v}</span> },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: (v) => <StatusTag map={BLOG_STATUS} value={v} /> },
    { title: 'Ngày tạo', dataIndex: 'createdAt', key: 'createdAt', render: (v) => formatDate(v) },
    {
      title: '', key: 'action', render: (_, r) => (
        <Space>
          {r.status === 'pending' && <Button size="small" type="primary" onClick={() => doAction(() => blogsService.approve(r._id), 'Đã duyệt bài')}>Duyệt</Button>}
          {r.status === 'pending' && <Button size="small" danger onClick={() => doAction(() => blogsService.reject(r._id), 'Đã từ chối')}>Từ chối</Button>}
          <Button size="small" onClick={() => navigate('/admin/blogs/editor', { state: { blog: r } })}>Sửa</Button>
          <Popconfirm title="Xoá bài viết?" onConfirm={() => doAction(() => blogsService.deleteBlog(r._id), 'Đã xoá')}><Button size="small" danger>Xoá</Button></Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <>
      <PageHeader title="Quản lý Bài viết" extra={
        <Space wrap>
          <Input.Search allowClear placeholder="Tìm tiêu đề" value={search} onChange={(e) => onSearch(e.target.value)} style={{ width: 240 }} />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/admin/blogs/editor')}>Viết bài mới</Button>
        </Space>} />
      <Tabs activeKey={tab} onChange={(k) => { setTab(k); setPage(1) }} items={[{ key: 'all', label: 'Tất cả' }, { key: 'pending', label: 'Chờ duyệt (Facebook crawl)' }, { key: 'published', label: 'Đã đăng' }]} />
      {query.error && <Alert type="error" showIcon title={query.error} style={{ marginBottom: 12 }} />}
      <Table rowKey="_id" loading={query.loading} columns={columns} dataSource={rows}
        pagination={{ current: page, pageSize, total, onChange: setPage, showSizeChanger: false }} />
    </>
  )
}

export function AdminBlogEditor() {
  const { message } = App.useApp()
  const navigate = useNavigate()
  const { state } = useLocation()
  const editing = state?.blog
  const [form] = Form.useForm()
  const [saving, setSaving] = useState(false)

  const onFinish = async (values) => {
    setSaving(true)
    try {
      if (editing?._id) await blogsService.updateBlog(editing._id, values)
      else await blogsService.createBlog(values)
      message.success('Đã lưu bài viết')
      navigate('/admin/blogs')
    } catch (e) { message.error(e?.error?.message || 'Không lưu được bài viết') }
    finally { setSaving(false) }
  }

  return (
    <>
      <PageHeader title={editing ? 'Sửa bài viết' : 'Viết bài mới'} />
      <Form form={form} layout="vertical" onFinish={onFinish}
        initialValues={editing ? { ...editing, category: editing.category?.name || editing.category } : { status: 'draft' }}>
        <Row gutter={16}>
          <Col xs={24} lg={16}>
            <Card>
              <Form.Item name="title" label="Tiêu đề" rules={[{ required: true, message: 'Nhập tiêu đề' }]}><Input size="large" placeholder="Tiêu đề bài viết" /></Form.Item>
              <Form.Item name="content" label="Nội dung"><Input.TextArea rows={14} placeholder="Nội dung bài viết..." /></Form.Item>
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card title="Xuất bản">
              <Form.Item name="status" label="Trạng thái"><Select options={Object.entries(BLOG_STATUS).map(([value, cfg]) => ({ value, label: cfg.label }))} /></Form.Item>
              <Form.Item name="category" label="Danh mục"><Input placeholder="Danh mục" /></Form.Item>
              <Form.Item name="thumbnail" label="Ảnh đại diện (URL)"><Input placeholder="https://..." /></Form.Item>
              <Button type="primary" htmlType="submit" loading={saving} block>Lưu bài</Button>
            </Card>
          </Col>
        </Row>
      </Form>
    </>
  )
}

// ---- FAQs -----------------------------------------------------------------
export function AdminFaqs() {
  const { message } = App.useApp()
  const [editing, setEditing] = useState(null)
  const [open, setOpen] = useState(false)
  const [form] = Form.useForm()
  const { search, onSearch, debounced, page, setPage, pageSize } = useListParams()
  const query = useApiQuery(
    () => faqsService.getFaqs({ search: debounced || undefined, page, limit: pageSize }),
    [debounced, page],
  )
  const rows = query.data?.items || []
  const total = query.data?.pagination?.total || 0

  const openModal = (row) => { setEditing(row || null); setOpen(true) }
  const submit = async () => {
    const values = await form.validateFields()
    // Loại bỏ field rỗng/null để không gửi '' cho các field ObjectId (category, relatedService).
    const payload = Object.fromEntries(Object.entries(values).filter(([, v]) => v !== '' && v != null))
    try {
      if (editing?._id) await faqsService.updateFaq(editing._id, payload)
      else await faqsService.createFaq(payload)
      message.success('Đã lưu FAQ'); setOpen(false); query.refetch()
    } catch (e) { message.error(e?.error?.message || 'Không lưu được FAQ') }
  }
  const remove = async (row) => {
    try { await faqsService.deleteFaq(row._id); message.success('Đã xoá'); query.refetch() } catch { message.error('Không xoá được') }
  }
  const move = async (index, dir) => {
    const next = [...rows]
    const target = index + dir
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    try { await faqsService.reorder(next.map((f) => f._id)); message.success('Đã cập nhật thứ tự'); query.refetch() }
    catch { message.error('Không cập nhật được thứ tự') }
  }

  const columns = [
    { title: '#', key: 'order', width: 90, render: (_, __, i) => (
      <Space>
        <Button size="small" disabled={i === 0} onClick={() => move(i, -1)}>↑</Button>
        <Button size="small" disabled={i === rows.length - 1} onClick={() => move(i, 1)}>↓</Button>
      </Space>
    ) },
    { title: 'Câu hỏi', dataIndex: 'question', key: 'question', render: (v) => <span className="cell-strong">{v}</span> },
    { title: 'Danh mục', dataIndex: 'category', key: 'category', render: (v) => v?.name || (typeof v === 'string' && v.length !== 24 ? v : '—') },
    { title: '', key: 'action', render: (_, r) => (
      <Space>
        <Button size="small" onClick={() => openModal(r)}>Sửa</Button>
        <Popconfirm title="Xoá FAQ?" onConfirm={() => remove(r)}><Button size="small" danger>Xoá</Button></Popconfirm>
      </Space>
    ) },
  ]

  return (
    <>
      <PageHeader title="Quản lý Hỏi đáp" extra={
        <Space wrap>
          <Input.Search allowClear placeholder="Tìm câu hỏi" value={search} onChange={(e) => onSearch(e.target.value)} style={{ width: 240 }} />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal(null)}>Tạo FAQ</Button>
        </Space>} />
      {query.error && <Alert type="error" showIcon title={query.error} style={{ marginBottom: 12 }} />}
      <Table rowKey="_id" loading={query.loading} columns={columns} dataSource={rows}
        pagination={{ current: page, pageSize, total, onChange: setPage, showSizeChanger: false }} />
      <Modal title={editing ? 'Sửa FAQ' : 'Tạo FAQ'} open={open} onOk={submit} onCancel={() => setOpen(false)} destroyOnHidden>
        <Form form={form} layout="vertical" key={editing?._id || 'new'} initialValues={editing || { question: '', answer: '' }}>
          <Form.Item name="question" label="Câu hỏi" rules={[{ required: true, message: 'Nhập câu hỏi' }]}><Input /></Form.Item>
          <Form.Item name="answer" label="Trả lời" rules={[{ required: true, message: 'Nhập câu trả lời' }]}><Input.TextArea rows={4} /></Form.Item>
        </Form>
      </Modal>
    </>
  )
}

// ---- Services & Store products -------------------------------------------
export function AdminServices() {
  return (
    <>
      <PageHeader title="Dịch vụ & Gian hàng" />
      <Tabs items={[
        { key: 'services', label: 'Dịch vụ', children: <ServicesTable /> },
        { key: 'products', label: 'Sản phẩm workflow', children: <StoreProductsTable /> },
      ]} />
    </>
  )
}

function ServicesTable() {
  const { message } = App.useApp()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form] = Form.useForm()
  const { search, onSearch, debounced, page, setPage, pageSize } = useListParams()
  const query = useApiQuery(
    () => servicesService.getServices({ search: debounced || undefined, page, limit: pageSize }),
    [debounced, page],
  )
  const rows = query.data?.items || []
  const total = query.data?.pagination?.total || 0

  const openModal = (row) => { setEditing(row || null); setOpen(true) }
  const submit = async () => {
    const values = await form.validateFields()
    try {
      if (editing?._id) await servicesService.updateService(editing._id, values)
      else await servicesService.createService(values)
      message.success('Đã lưu dịch vụ'); setOpen(false); query.refetch()
    } catch { message.error('Không lưu được dịch vụ') }
  }
  const remove = async (row) => { try { await servicesService.deleteService(row._id); message.success('Đã xoá'); query.refetch() } catch { message.error('Không xoá được') } }

  const columns = [
    { title: 'Tên dịch vụ', dataIndex: 'name', key: 'name', render: (v) => <span className="cell-strong">{v}</span> },
    { title: 'Giá', dataIndex: 'price', key: 'price', render: (v) => formatCurrency(v) },
    { title: '', key: 'action', render: (_, r) => (
      <Space><Button size="small" onClick={() => openModal(r)}>Sửa</Button><Popconfirm title="Xoá?" onConfirm={() => remove(r)}><Button size="small" danger>Xoá</Button></Popconfirm></Space>
    ) },
  ]
  return (
    <>
      <Space style={{ marginBottom: 12 }} wrap>
        <Input.Search allowClear placeholder="Tìm tên dịch vụ" value={search} onChange={(e) => onSearch(e.target.value)} style={{ width: 240 }} />
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal(null)}>Thêm dịch vụ</Button>
      </Space>
      <Table rowKey="_id" loading={query.loading} columns={columns} dataSource={rows}
        pagination={{ current: page, pageSize, total, onChange: setPage, showSizeChanger: false }} />
      <Modal title={editing ? 'Sửa dịch vụ' : 'Thêm dịch vụ'} open={open} onOk={submit} onCancel={() => setOpen(false)} destroyOnHidden>
        <Form form={form} layout="vertical" key={editing?._id || 'new'} initialValues={editing || { name: '', price: 0, description: '' }}>
          <Form.Item name="name" label="Tên" rules={[{ required: true, message: 'Nhập tên' }]}><Input /></Form.Item>
          <Form.Item name="price" label="Giá" rules={[{ required: true, message: 'Nhập giá' }]}><InputNumber style={{ width: '100%' }} min={0} /></Form.Item>
          <Form.Item name="description" label="Mô tả"><Input.TextArea rows={3} /></Form.Item>
        </Form>
      </Modal>
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
    { title: '', key: 'action', render: (_, r) => (
      <Space><Button size="small" onClick={() => openModal(r)}>Sửa</Button><Popconfirm title="Xoá?" onConfirm={() => remove(r)}><Button size="small" danger>Xoá</Button></Popconfirm></Space>
    ) },
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
export function AdminChat() {
  const { message } = App.useApp()
  const [activeId, setActiveId] = useState(null)
  const [text, setText] = useState('')
  const { search, onSearch, debounced, page, setPage, pageSize } = useListParams()
  const sessionsQ = useApiQuery(
    () => chatService.getSessions({ search: debounced || undefined, page, limit: pageSize }),
    [debounced, page],
  )
  const sessions = sessionsQ.data?.items || []
  const total = sessionsQ.data?.pagination?.total || 0
  const messagesQ = useApiQuery(() => chatService.getMessages(activeId), [activeId], { enabled: !!activeId })
  const messages = messagesQ.data || []

  const { sendMessage } = useChatSocket(activeId, {
    role: 'admin',
    onMessage: () => messagesQ.refetch(),
  })

  const active = useMemo(() => sessions.find((s) => s._id === activeId), [sessions, activeId])

  const takeover = async () => { try { await chatService.takeover(activeId); message.success('Đã tiếp quản hội thoại'); sessionsQ.refetch() } catch { message.error('Lỗi tiếp quản') } }
  const release = async () => { try { await chatService.release(activeId); message.success('Đã trả về Bot'); sessionsQ.refetch() } catch { message.error('Lỗi trả về bot') } }
  const feedback = async (msgId, value) => { try { await chatService.setFeedback(msgId, value); message.success('Đã ghi nhận'); messagesQ.refetch() } catch { message.error('Lỗi') } }
  const send = () => { if (!text.trim()) return; sendMessage(text); setText(''); setTimeout(() => messagesQ.refetch(), 300) }

  return (
    <>
      <PageHeader title="Trung tâm Chat" extra={<Button icon={<ReloadOutlined />} onClick={sessionsQ.refetch}>Làm mới</Button>} />
      <Row gutter={16}>
        <Col xs={24} md={8}>
          <Input.Search allowClear placeholder="Tìm tên / SĐT khách" value={search} onChange={(e) => onSearch(e.target.value)} style={{ marginBottom: 12 }} />
          <Card styles={{ body: { padding: 0, maxHeight: 560, overflow: 'auto' } }}>
            <List
              loading={sessionsQ.loading}
              dataSource={sessions}
              locale={{ emptyText: 'Chưa có phiên chat' }}
              pagination={total > pageSize ? { current: page, pageSize, total, onChange: setPage, size: 'small', align: 'center' } : false}
              renderItem={(s) => (
                <List.Item onClick={() => setActiveId(s._id)}
                  style={{ padding: 12, cursor: 'pointer', background: s._id === activeId ? '#CCFBF1' : undefined }}>
                  <List.Item.Meta
                    title={<Space>{s.customerName || 'Khách ẩn danh'} <StatusTag map={CHAT_MODE} value={s.mode} /></Space>}
                    description={s.customerPhone || 'Ẩn danh'} />
                </List.Item>
              )} />
          </Card>
        </Col>
        <Col xs={24} md={16}>
          <Card
            title={active ? (active.customerName || 'Khách ẩn danh') : 'Chọn một phiên chat'}
            extra={active && (active.mode === 'bot'
              ? <Button size="small" type="primary" onClick={takeover}>Nhảy vào hội thoại</Button>
              : <Button size="small" onClick={release}>Trả về cho Bot</Button>)}
          >
            <QueryState loading={messagesQ.loading} empty={activeId && !messages.length} error={messagesQ.error}>
              {!activeId ? <Empty description="Chọn phiên để xem hội thoại" /> : (
                <div style={{ maxHeight: 420, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {messages.map((m) => (
                    <div key={m._id} style={{ alignSelf: m.sender === 'customer' ? 'flex-start' : 'flex-end', maxWidth: '70%' }}>
                      <div style={{ padding: '8px 12px', borderRadius: 12, background: m.sender === 'customer' ? '#F1F5F9' : '#CCFBF1' }}>{m.content}</div>
                      {m.sender === 'bot' && (
                        <Space size={4} style={{ marginTop: 2 }}>
                          <Button type="text" size="small" icon={<LikeOutlined />} onClick={() => feedback(m._id, 'good')} />
                          <Button type="text" size="small" icon={<DislikeOutlined />} onClick={() => feedback(m._id, 'bad')} />
                        </Space>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </QueryState>
            {activeId && (
              <Space.Compact style={{ width: '100%', marginTop: 12 }}>
                <Input placeholder="Nhập phản hồi..." value={text} onChange={(e) => setText(e.target.value)} onPressEnter={send} />
                <Button type="primary" onClick={send}>Gửi</Button>
              </Space.Compact>
            )}
          </Card>
        </Col>
      </Row>
    </>
  )
}

// ---- Logs -----------------------------------------------------------------
export function AdminLogs() {
  const { message } = App.useApp()
  const { search, onSearch, debounced, page, setPage } = useListParams(20)
  const query = useApiQuery(
    () => logsService.getLogs({ page, limit: 20, search: debounced || undefined }),
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
        pagination={{ current: page, pageSize: 20, total: query.data?.pagination?.total || 0, onChange: setPage }} />
    </>
  )
}

// ---- Users & permissions --------------------------------------------------
export function AdminUsers() {
  const { message } = App.useApp()
  const [open, setOpen] = useState(false)
  const [permOpen, setPermOpen] = useState(false)
  const [form] = Form.useForm()
  const { search, onSearch, debounced, page, setPage, pageSize } = useListParams()
  const query = useApiQuery(
    () => usersService.getUsers({ search: debounced || undefined, page, limit: pageSize }),
    [debounced, page],
  )
  const rows = query.data?.items || []
  const total = query.data?.pagination?.total || 0

  const toggleStatus = async (row, checked) => {
    try { await usersService.updateUser(row._id, { status: checked ? 'active' : 'locked' }); message.success('Đã cập nhật'); query.refetch() }
    catch { message.error('Không cập nhật được') }
  }
  const createUser = async () => {
    const values = await form.validateFields()
    try { await usersService.createUser(values); message.success('Đã tạo tài khoản'); setOpen(false); query.refetch() }
    catch (e) { message.error(e?.error?.message || 'Không tạo được tài khoản') }
  }

  const columns = [
    { title: 'Tên', dataIndex: 'name', key: 'name', render: (v) => <span className="cell-strong">{v}</span> },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Vai trò', dataIndex: 'role', key: 'role', render: (v) => <Tag>{v}</Tag> },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: (v, r) => <Switch checked={v === 'active'} onChange={(c) => toggleStatus(r, c)} /> },
  ]
  return (
    <>
      <PageHeader title="Người dùng & Phân quyền" extra={
        <Space wrap>
          <Input.Search allowClear placeholder="Tìm tên / email" value={search} onChange={(e) => onSearch(e.target.value)} style={{ width: 240 }} />
          <Button onClick={() => setPermOpen(true)}>Ma trận quyền</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setOpen(true)}>Thêm tài khoản</Button>
        </Space>} />
      {query.error && <Alert type="error" showIcon title={query.error} style={{ marginBottom: 12 }} />}
      <Table rowKey="_id" loading={query.loading} columns={columns} dataSource={rows}
        pagination={{ current: page, pageSize, total, onChange: setPage, showSizeChanger: false }} />

      <Modal title="Thêm tài khoản" open={open} onOk={createUser} onCancel={() => setOpen(false)} destroyOnHidden>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Họ tên" rules={[{ required: true, message: 'Nhập tên' }]}><Input /></Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Email không hợp lệ' }]}><Input /></Form.Item>
          <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, min: 6, message: 'Tối thiểu 6 ký tự' }]}><Input.Password /></Form.Item>
          <Form.Item name="role" label="Vai trò" initialValue="sales"><Select options={['admin', 'sales', 'editor'].map((r) => ({ value: r, label: r }))} /></Form.Item>
        </Form>
      </Modal>

      <RolePermissionsModal open={permOpen} onClose={() => setPermOpen(false)} />
    </>
  )
}

const PERM_MODULES = ['leads', 'orders', 'blogs', 'faqs', 'chat', 'logs', 'users']
const PERM_ACTIONS = ['view', 'create', 'update', 'delete']

function RolePermissionsModal({ open, onClose }) {
  const { message } = App.useApp()
  const [matrix, setMatrix] = useState({})
  const toggle = (mod, act) => setMatrix((m) => ({ ...m, [`${mod}_${act}`]: !m[`${mod}_${act}`] }))
  const save = async () => {
    try {
      await rolesService.updatePermissions(matrix)
      message.success('Đã lưu phân quyền')
      onClose()
    } catch { message.error('Backend chưa có /admin/roles/permissions (xem API_ADDITIONS.md)') }
  }
  const columns = [
    { title: 'Module', dataIndex: 'module', key: 'module', render: (v) => <b>{v}</b> },
    ...PERM_ACTIONS.map((act) => ({
      title: act, key: act, align: 'center',
      render: (_, r) => <Switch size="small" checked={!!matrix[`${r.module}_${act}`]} onChange={() => toggle(r.module, act)} />,
    })),
  ]
  return (
    <Modal title="Ma trận phân quyền" open={open} onOk={save} onCancel={onClose} width={640}>
      <Table rowKey="module" size="small" pagination={false} columns={columns} dataSource={PERM_MODULES.map((m) => ({ module: m }))} />
    </Modal>
  )
}

// ---- Settings -------------------------------------------------------------
export function AdminSettings() {
  return (
    <>
      <PageHeader title="Cấu hình hệ thống" />
      <Tabs items={[
        { key: 'appearance', label: 'Giao diện', children: <AppearanceTab /> },
        { key: 'site', label: 'Thông tin website', children: <SiteInfoTab /> },
        { key: 'api', label: 'Cấu hình API', children: <ApiConfigsTab /> },
      ]} />
    </>
  )
}

function AppearanceTab() {
  const { message } = App.useApp()
  const query = useApiQuery(() => settingsService.getAppearance(), [])
  const [form] = Form.useForm()
  const save = async () => {
    const values = await form.validateFields()
    try { await settingsService.updateAppearance(values); message.success('Đã lưu giao diện') } catch { message.error('Không lưu được') }
  }
  return (
    <Card style={{ maxWidth: 520 }}>
      <QueryState loading={query.loading} error={query.error}>
        <Form form={form} layout="vertical" initialValues={query.data || { themeMode: 'light', primaryColor: '#0F766E' }}>
          <Form.Item name="themeMode" label="Chế độ"><Segmented options={[{ label: 'Sáng', value: 'light' }, { label: 'Tối', value: 'dark' }]} /></Form.Item>
          <Form.Item name="primaryColor" label="Màu thương hiệu"><Input type="color" style={{ width: 80, padding: 2 }} /></Form.Item>
          <Button type="primary" onClick={save}>Lưu thay đổi</Button>
        </Form>
      </QueryState>
    </Card>
  )
}

function SiteInfoTab() {
  const { message } = App.useApp()
  const query = useApiQuery(() => settingsService.getSiteInfo(), [])
  const [form] = Form.useForm()
  const save = async () => {
    const values = await form.validateFields()
    try { await settingsService.updateSiteInfo(values); message.success('Đã lưu thông tin site') } catch { message.error('Không lưu được') }
  }
  const uploadProps = {
    showUploadList: false,
    customRequest: async ({ file, onSuccess, onError }) => {
      try { const res = await settingsService.uploadAsset(file); form.setFieldValue('logoUrl', res?.url || res); message.success('Đã tải lên'); onSuccess?.(res) }
      catch (e) { message.error('Tải lên thất bại'); onError?.(e) }
    },
  }
  return (
    <Card style={{ maxWidth: 520 }}>
      <QueryState loading={query.loading} error={query.error}>
        <Form form={form} layout="vertical" initialValues={query.data || {}}>
          <Form.Item name="siteName" label="Tên website"><Input placeholder="LOSA247.VN" /></Form.Item>
          <Form.Item name="slogan" label="Slogan"><Input /></Form.Item>
          <Form.Item name="logoUrl" label="Logo (URL)"><Input placeholder="https://..." /></Form.Item>
          <Upload {...uploadProps}><Button icon={<UploadOutlined />}>Tải logo lên</Button></Upload>
          <div style={{ marginTop: 16 }}><Button type="primary" onClick={save}>Lưu thông tin</Button></div>
        </Form>
      </QueryState>
    </Card>
  )
}

function ApiConfigsTab() {
  const { message } = App.useApp()
  const query = useApiQuery(() => apiConfigsService.getConfigs(), [])
  const configs = query.data || []
  const providers = ['facebook', 'zalo', 'openai', 'anthropic', 'n8n']

  const test = async (provider) => {
    try { const res = await apiConfigsService.testConnection(provider); message.success(res?.message || `Kết nối ${provider} OK`) }
    catch (e) { message.error(e?.error?.message || `Kết nối ${provider} thất bại`) }
  }

  return (
    <QueryState loading={query.loading} error={query.error}>
      <Row gutter={[16, 16]}>
        {providers.map((p) => {
          const cfg = configs.find((c) => c.provider === p) || {}
          return <Col xs={24} md={12} key={p}><ApiConfigCard provider={p} config={cfg} onTest={() => test(p)} onSaved={query.refetch} /></Col>
        })}
      </Row>
    </QueryState>
  )
}

function ApiConfigCard({ provider, config, onTest, onSaved }) {
  const { message } = App.useApp()
  const [form] = Form.useForm()
  const save = async () => {
    const values = await form.validateFields()
    try { await apiConfigsService.updateConfig(provider, values); message.success(`Đã lưu ${provider}`); onSaved?.() }
    catch { message.error('Không lưu được cấu hình') }
  }
  return (
    <Card title={provider.toUpperCase()} extra={<Button size="small" onClick={onTest}>Test kết nối</Button>}>
      <Form form={form} layout="vertical" initialValues={{ apiKey: config.apiKey || '', isActive: config.isActive ?? false }}>
        <Form.Item name="apiKey" label="API Key"><Input.Password placeholder="••••••" /></Form.Item>
        <Form.Item name="isActive" label="Kích hoạt" valuePropName="checked"><Switch /></Form.Item>
        <Button type="primary" size="small" onClick={save}>Lưu</Button>
      </Form>
    </Card>
  )
}
