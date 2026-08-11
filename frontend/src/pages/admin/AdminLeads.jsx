import { useMemo, useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import EmojiPicker from 'emoji-picker-react'
import {
  Alert, App, Button, Card, Col, Descriptions, Drawer, Empty, Form, Input, InputNumber, List,
  Modal, Popconfirm, Row, Segmented, Select, Space, Spin, Statistic, Steps, Switch, Table, Tabs,
  Tag, Timeline, Typography, Upload, Dropdown, DatePicker, Avatar, Badge,
} from 'antd'
import { Editor } from '@tinymce/tinymce-react'
import {
  DownloadOutlined, PlusOutlined, ReloadOutlined, SettingOutlined, UploadOutlined, LikeOutlined, DislikeOutlined, CloseOutlined,
  FileTextOutlined, CheckCircleOutlined, ClockCircleOutlined, EyeOutlined, SmileOutlined, PictureOutlined, PaperClipOutlined,
  EditOutlined, DeleteOutlined, PhoneOutlined, MailOutlined
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
import { useAuthStore } from '../../stores/authStore'
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

export function AdminLeads() {
  const { message } = App.useApp()
  const { search, onSearch, debounced, page, setPage, pageSize } = useListParams()
  const [filters, setFilters] = useState({ status: '', source: '', assignedTo: '', dates: null })
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [detailId, setDetailId] = useState(null)
  const [openForm, setOpenForm] = useState(false)
  const [emailOpen, setEmailOpen] = useState(false)
  const [editingLead, setEditingLead] = useState(null)
  const [bulkLoading, setBulkLoading] = useState(false)
  const [form] = Form.useForm()
  const [emailForm] = Form.useForm()
  const hasPermission = useAuthStore((state) => state.hasPermission)
  const canCreate = hasPermission('leads.create')
  const canUpdate = hasPermission('leads.update')
  const canDelete = hasPermission('leads.delete')
  const canAssign = hasPermission('leads.assign')
  const canExport = hasPermission('leads.export')
  const canViewUsers = hasPermission('users.view')

  const params = {
    page, limit: pageSize, search: debounced || undefined,
    status: filters.status || undefined, source: filters.source || undefined,
    assignedTo: filters.assignedTo || undefined,
    fromDate: filters.dates?.[0]?.format('YYYY-MM-DD'),
    toDate: filters.dates?.[1]?.format('YYYY-MM-DD'),
  }
  const query = useApiQuery(() => leadsService.getLeads(params), [page, debounced, filters.status, filters.source, filters.assignedTo, filters.dates])
  const statsQuery = useApiQuery(() => leadsService.getLeadStats(), [])
  const usersQuery = useApiQuery(() => usersService.getUsers({ limit: 100 }), [], { enabled: canViewUsers })
  const rows = query.data?.items || []
  const total = query.data?.pagination?.total || 0
  const stats = statsQuery.data || { total: 0, byStatus: {}, percentChange: 0 }
  const users = usersQuery.data?.items || []
  const sourceOptions = [
    { value: 'form', label: 'Biểu mẫu' }, { value: 'chat', label: 'Chat' },
    { value: 'facebook', label: 'Facebook' }, { value: 'zalo', label: 'Zalo' },
    { value: 'other', label: 'Khác' },
  ]

  const refresh = () => { query.refetch(); statsQuery.refetch() }
  const updateFilter = (key, value) => { setFilters((prev) => ({ ...prev, [key]: value })); setPage(1) }
  const resetFilters = () => { setFilters({ status: '', source: '', assignedTo: '', dates: null }); onSearch(''); setPage(1) }

  const handleExport = async () => {
    try {
      const blob = await leadsService.exportLeads({ ...params, page: undefined, limit: undefined, ids: selectedRowKeys.length ? selectedRowKeys.join(',') : undefined })
      downloadBlob(blob, selectedRowKeys.length ? `leads-da-chon-${selectedRowKeys.length}.xlsx` : 'danh-sach-leads.xlsx')
      message.success(selectedRowKeys.length ? `Đã xuất ${selectedRowKeys.length} Lead` : 'Đã xuất danh sách Lead')
    } catch { message.error('Không thể xuất Excel') }
  }

  const runBulkUpdate = async (data) => {
    setBulkLoading(true)
    try {
      await leadsService.bulkUpdateLeads(selectedRowKeys, data)
      message.success(`Đã cập nhật ${selectedRowKeys.length} Lead`)
      setSelectedRowKeys([]); refresh()
    } catch { message.error('Không thể cập nhật các Lead đã chọn') }
    finally { setBulkLoading(false) }
  }

  const handleBulkDelete = async () => {
    setBulkLoading(true)
    try {
      await leadsService.bulkDeleteLeads(selectedRowKeys)
      message.success(`Đã xóa ${selectedRowKeys.length} Lead`)
      setSelectedRowKeys([]); refresh()
    } catch { message.error('Không thể xóa các Lead đã chọn') }
    finally { setBulkLoading(false) }
  }

  const sendBulkEmail = async () => {
    try {
      const values = await emailForm.validateFields()
      setBulkLoading(true)
      const result = await leadsService.sendBulkEmail(selectedRowKeys, values.subject, values.content)
      message.success(`Đã gửi ${result?.sent || 0}/${result?.eligible || 0} email hợp lệ`)
      setEmailOpen(false); emailForm.resetFields(); setSelectedRowKeys([])
    } catch (error) { if (!error?.errorFields) message.error('Không thể gửi email') }
    finally { setBulkLoading(false) }
  }

  const openEdit = (lead) => {
    setEditingLead(lead)
    form.setFieldsValue({ name: lead.name, phone: lead.phone, email: lead.email, source: lead.source, status: lead.status, assignedTo: lead.assignedTo?._id })
    setOpenForm(true)
  }
  const openCreate = () => { setEditingLead(null); form.resetFields(); form.setFieldsValue({ status: 'new', source: 'form' }); setOpenForm(true) }
  const saveLead = async () => {
    try {
      const values = await form.validateFields()
      if (editingLead) await leadsService.updateLead(editingLead._id, values)
      else await leadsService.createLead(values)
      message.success(editingLead ? 'Đã cập nhật Lead' : 'Đã thêm Lead')
      setOpenForm(false); refresh()
    } catch (error) { if (!error?.errorFields) message.error('Không thể lưu Lead') }
  }
  const handleDelete = async (id) => {
    try { await leadsService.deleteLead(id); message.success('Đã xóa Lead'); refresh() }
    catch { message.error('Không thể xóa Lead') }
  }

  const sourceLabel = (source) => sourceOptions.find((item) => item.value === source)?.label || source || '—'
  const avatarColor = (name = '') => `hsl(${[...name].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 360} 62% 48%)`
  const columns = [
    {
      title: 'Khách hàng', key: 'customer', width: 245, render: (_, lead) => (
        <Space><Avatar style={{ background: avatarColor(lead.name) }}>{lead.name?.charAt(0)?.toUpperCase()}</Avatar>
          <div><div className="cell-strong">{lead.name}</div><Text type="secondary" style={{ fontSize: 12 }}>{lead.email || 'Chưa có email'}</Text></div></Space>
      ),
    },
    { title: 'SĐT', dataIndex: 'phone', width: 135, render: (phone) => phone ? <a href={`https://zalo.me/${phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer">{phone}</a> : '—' },
    { title: 'Nguồn', dataIndex: 'source', width: 120, render: (value) => <Tag>{sourceLabel(value)}</Tag> },
    {
      title: 'Nhân viên', dataIndex: 'assignedTo', width: 175, render: (user) => user ? (
        <Space><Avatar size={28} src={user.avatarUrl} style={{ background: avatarColor(user.name) }}>{!user.avatarUrl && user.name?.charAt(0)?.toUpperCase()}</Avatar><span>{user.name}</span></Space>
      ) : <Text type="secondary">Chưa gán</Text>,
    },
    { title: 'Trạng thái', dataIndex: 'status', width: 140, render: (value) => <StatusTag map={LEAD_STATUS} value={value} /> },
    { title: 'Cập nhật cuối', dataIndex: 'updatedAt', width: 140, render: (value) => <div>{dayjs(value).format('DD/MM/YYYY')}<br /><Text type="secondary" style={{ fontSize: 12 }}>{dayjs(value).format('HH:mm')}</Text></div> },
    {
      title: '', key: 'actions', fixed: 'right', width: 110, render: (_, lead) => <Space size={2}>
        <Button type="text" icon={<EyeOutlined />} onClick={() => setDetailId(lead._id)} />
        {canUpdate && <Button type="text" icon={<EditOutlined />} onClick={() => openEdit(lead)} />}
        {canDelete && <Popconfirm title="Xóa Lead này?" onConfirm={() => handleDelete(lead._id)}><Button type="text" danger icon={<DeleteOutlined />} /></Popconfirm>}
      </Space>,
    },
  ]
  const statItems = [
    { key: 'new', label: 'Lead mới', icon: <PlusOutlined />, color: '#2563eb' },
    { key: 'contacted', label: 'Đã liên hệ', icon: <PhoneOutlined />, color: '#0891b2' },
    { key: 'qualified', label: 'Tiềm năng', icon: <LikeOutlined />, color: '#d97706' },
    { key: 'converted', label: 'Đã chuyển đơn', icon: <CheckCircleOutlined />, color: '#16a34a' },
  ]

  return <>
    <PageHeader title={<><span>Quản lý Lead</span><div style={{ fontSize: 13, color: '#64748b', fontWeight: 400, marginTop: 4 }}>Quản lý và chăm sóc khách hàng tiềm năng</div></>}
      extra={<>{canExport && <Button icon={<DownloadOutlined />} onClick={handleExport}>Xuất Excel</Button>}{canCreate && <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Thêm Lead</Button>}</>} />

    <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
      {statItems.map((item) => <Col xs={24} sm={12} lg={6} key={item.key}><Card bordered={false} style={{ borderRadius: 14, boxShadow: '0 5px 24px rgba(15,23,42,.06)' }}>
        <Space align="start" style={{ width: '100%', justifyContent: 'space-between' }}><Statistic title={item.label} value={stats.byStatus?.[item.key] || 0} /><Avatar size={44} style={{ color: item.color, background: `${item.color}14` }} icon={item.icon} /></Space>
        <Text style={{ color: stats.percentChange >= 0 ? '#16a34a' : '#dc2626', fontSize: 12 }}>{stats.percentChange >= 0 ? '+' : ''}{Number(stats.percentChange || 0).toFixed(1)}% <span style={{ color: '#94a3b8' }}>so với hôm qua</span></Text>
      </Card></Col>)}
    </Row>

    <Card bordered={false} style={{ borderRadius: 14, boxShadow: '0 5px 24px rgba(15,23,42,.06)' }}>
      <Space wrap style={{ marginBottom: 16 }}>
        <Input.Search allowClear placeholder="Tìm tên, SĐT, email..." value={search} onChange={(event) => { onSearch(event.target.value); setPage(1) }} style={{ width: 240 }} />
        <Select allowClear placeholder="Nguồn" value={filters.source || undefined} onChange={(value) => updateFilter('source', value || '')} options={sourceOptions} style={{ width: 145 }} />
        <Select allowClear showSearch optionFilterProp="label" placeholder="Nhân viên phụ trách" value={filters.assignedTo || undefined} onChange={(value) => updateFilter('assignedTo', value || '')} options={users.map((user) => ({ value: user._id, label: user.name }))} style={{ width: 190 }} />
        <Select allowClear placeholder="Trạng thái" value={filters.status || undefined} onChange={(value) => updateFilter('status', value || '')} options={Object.entries(LEAD_STATUS).map(([value, item]) => ({ value, label: item.label }))} style={{ width: 160 }} />
        <DatePicker.RangePicker value={filters.dates} onChange={(value) => updateFilter('dates', value)} format="DD/MM/YYYY" />
        <Button icon={<ReloadOutlined />} onClick={resetFilters}>Làm mới</Button>
      </Space>

      <div style={{ overflowX: 'auto', marginBottom: 16 }}><Segmented value={filters.status} onChange={(value) => updateFilter('status', value)} options={[
        { value: '', label: `Tất cả (${stats.total || 0})` },
        ...Object.entries(LEAD_STATUS).map(([value, item]) => ({ value, label: `${item.label} (${stats.byStatus?.[value] || 0})` })),
      ]} /></div>

      {selectedRowKeys.length > 0 && <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', padding: '13px 16px', marginBottom: 16, borderRadius: 12, border: '1px solid #c4b5fd', background: 'linear-gradient(100deg,#f5f3ff,#faf5ff)' }}>
        <Space wrap><Badge count={selectedRowKeys.length} showZero color="#7c3aed" /><div><strong>Đã chọn {selectedRowKeys.length} Lead</strong><br /><Button type="link" size="small" style={{ padding: 0 }} onClick={() => setSelectedRowKeys([])}>Bỏ chọn</Button></div>
          {canUpdate && <Select disabled={bulkLoading} placeholder="Đổi trạng thái" onChange={(value) => runBulkUpdate({ status: value })} options={Object.entries(LEAD_STATUS).map(([value, item]) => ({ value, label: item.label }))} style={{ width: 155 }} value={undefined} />}
          {canAssign && <Select disabled={bulkLoading} showSearch optionFilterProp="label" placeholder="Gán nhân viên" onChange={(value) => runBulkUpdate({ assignedTo: value })} options={users.map((user) => ({ value: user._id, label: user.name }))} style={{ width: 175 }} value={undefined} />}
          {canUpdate && <Select disabled={bulkLoading} placeholder="Đổi nguồn" onChange={(value) => runBulkUpdate({ source: value })} options={sourceOptions} style={{ width: 145 }} value={undefined} />}
        </Space>
        <Space wrap>{canUpdate && <Button icon={<MailOutlined />} onClick={() => setEmailOpen(true)}>Gửi email</Button>}{canExport && <Button icon={<DownloadOutlined />} onClick={handleExport}>Xuất Excel</Button>}{canDelete && <Popconfirm title={`Xóa ${selectedRowKeys.length} Lead đã chọn?`} onConfirm={handleBulkDelete}><Button danger icon={<DeleteOutlined />}>Xóa</Button></Popconfirm>}</Space>
      </div>}

      {query.error && <Alert type="error" showIcon message={query.error} style={{ marginBottom: 12 }} />}
      <Table rowKey="_id" loading={query.loading || bulkLoading} columns={columns} dataSource={rows} scroll={{ x: 1150 }} rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys, preserveSelectedRowKeys: true }} pagination={{ current: page, pageSize, total, onChange: setPage, showSizeChanger: false, showTotal: (count) => `${count} Lead` }} />
    </Card>

    <LeadDetailDrawer id={detailId} open={!!detailId} onClose={() => setDetailId(null)} onChanged={refresh} />
    <Modal title={editingLead ? 'Chỉnh sửa Lead' : 'Thêm Lead mới'} open={openForm} onOk={saveLead} onCancel={() => setOpenForm(false)} destroyOnHidden>
      <Form form={form} layout="vertical"><Form.Item name="name" label="Tên khách hàng" rules={[{ required: true, message: 'Nhập tên khách hàng' }]}><Input /></Form.Item><Form.Item name="phone" label="Số điện thoại" rules={[{ required: true, message: 'Nhập số điện thoại' }]}><Input /></Form.Item><Form.Item name="email" label="Email" rules={[{ type: 'email', message: 'Email không hợp lệ' }]}><Input /></Form.Item><Row gutter={12}><Col span={12}><Form.Item name="source" label="Nguồn" rules={[{ required: true }]}><Select options={sourceOptions} /></Form.Item></Col><Col span={12}><Form.Item name="status" label="Trạng thái"><Select options={Object.entries(LEAD_STATUS).map(([value, item]) => ({ value, label: item.label }))} /></Form.Item></Col></Row><Form.Item name="assignedTo" label="Nhân viên phụ trách"><Select allowClear showSearch optionFilterProp="label" options={users.map((user) => ({ value: user._id, label: user.name }))} /></Form.Item></Form>
    </Modal>
    <Modal title={`Gửi email cho ${selectedRowKeys.length} Lead`} open={emailOpen} confirmLoading={bulkLoading} onOk={sendBulkEmail} onCancel={() => setEmailOpen(false)} okText="Gửi email" destroyOnHidden width={620}>
      <Alert type="info" showIcon message="Hệ thống tự bỏ qua khách hàng chưa có email." style={{ marginBottom: 16 }} /><Form form={emailForm} layout="vertical"><Form.Item name="subject" label="Tiêu đề" rules={[{ required: true, message: 'Nhập tiêu đề email' }]}><Input maxLength={200} showCount /></Form.Item><Form.Item name="content" label="Nội dung" rules={[{ required: true, message: 'Nhập nội dung email' }]}><Input.TextArea rows={9} placeholder="Có thể nhập nội dung HTML..." /></Form.Item></Form>
    </Modal>
  </>
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
                { 
                  key: 'phone', 
                  label: 'SĐT', 
                  children: lead.phone ? (
                    <a href={`https://zalo.me/${lead.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" style={{ color: '#0d9488', fontWeight: 500 }}>
                      {lead.phone}
                    </a>
                  ) : '—' 
                },
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
