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
  FileTextOutlined, CheckCircleOutlined, ClockCircleOutlined, EyeOutlined, SmileOutlined, PictureOutlined, PaperClipOutlined,
  EditOutlined, DeleteOutlined
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

export function AdminLeads() {
  const { message } = App.useApp()
  const { search, onSearch, debounced, page, setPage, pageSize } = useListParams()
  const [status, setStatus] = useState()
  const [detailId, setDetailId] = useState(null)
  const [openForm, setOpenForm] = useState(false)
  const [editingLead, setEditingLead] = useState(null)
  const [form] = Form.useForm()

  const query = useApiQuery(
    () => leadsService.getLeads({ page, limit: pageSize, search: debounced || undefined, status }),
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

  const handleDelete = async (id) => {
    try {
      await leadsService.deleteLead(id)
      message.success('Đã xóa lead')
      query.refetch()
    } catch {
      message.error('Lỗi khi xóa')
    }
  }

  const openEdit = (row) => {
    setEditingLead(row)
    form.setFieldsValue({
      name: row.name,
      phone: row.phone,
      email: row.email,
      source: row.source,
      status: row.status,
    })
    setOpenForm(true)
  }

  const openCreate = () => {
    setEditingLead(null)
    form.resetFields()
    setOpenForm(true)
  }

  const saveLead = async () => {
    try {
      const values = await form.validateFields()
      if (editingLead) {
        await leadsService.updateLead(editingLead._id, values)
        message.success('Đã cập nhật')
      } else {
        await leadsService.createLead(values)
        message.success('Đã thêm lead')
      }
      setOpenForm(false)
      query.refetch()
    } catch (e) {
      if (e?.errorFields) return
      message.error('Lỗi lưu lead')
    }
  }

  const columns = [
    { title: 'Tên', dataIndex: 'name', key: 'name', render: (v) => <span className="cell-strong">{v}</span> },
    { 
      title: 'SĐT', 
      dataIndex: 'phone', 
      key: 'phone',
      render: (v) => v ? (
        <a href={`https://zalo.me/${v.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" style={{ color: '#0d9488', fontWeight: 500 }}>
          {v}
        </a>
      ) : '—'
    },
    { title: 'Nguồn', dataIndex: 'source', key: 'source' },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: (v) => <StatusTag map={LEAD_STATUS} value={v} /> },
    { title: 'Ngày tạo', dataIndex: 'createdAt', key: 'createdAt', render: (v) => formatDate(v) },
    {
      title: 'Thao tác', key: 'action', width: 140, render: (_, r) => (
        <Space>
          <Button size="small" type="text" icon={<EyeOutlined style={{ color: '#0ea5e9' }} />} onClick={() => setDetailId(r._id)} />
          <Button size="small" type="text" icon={<EditOutlined style={{ color: '#0d9488' }} />} onClick={() => openEdit(r)} />
          <Popconfirm title="Xóa lead này?" onConfirm={() => handleDelete(r._id)}>
            <Button size="small" type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    },
  ]

  return (
    <>
      <PageHeader title="Quản lý Lead" extra={<Button icon={<DownloadOutlined />} onClick={handleExport}>Xuất Excel</Button>} />
      <Space style={{ marginBottom: 16 }} wrap>
        <Input.Search allowClear placeholder="Tìm tên / SĐT" value={search} onChange={(e) => { onSearch(e.target.value); setPage(1) }} style={{ width: 260 }} />
        <Select allowClear placeholder="Trạng thái" style={{ width: 180 }} value={status} onChange={(v) => { setStatus(v); setPage(1) }}
          options={[{ value: '', label: 'Tất cả' }, ...Object.entries(LEAD_STATUS).map(([value, cfg]) => ({ value, label: cfg.label }))]} />
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Thêm mới</Button>
      </Space>
      {query.error && <Alert type="error" showIcon title={query.error} style={{ marginBottom: 12 }} />}
      <Table rowKey="_id" loading={query.loading} columns={columns} dataSource={rows}
        pagination={{ current: page, pageSize, total, onChange: setPage, showSizeChanger: false }} />
      <LeadDetailDrawer id={detailId} open={!!detailId} onClose={() => setDetailId(null)} onChanged={query.refetch} />

      <Modal title={editingLead ? 'Sửa Lead' : 'Thêm Lead mới'} open={openForm} onOk={saveLead} onCancel={() => setOpenForm(false)} destroyOnHidden>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Tên khách hàng" rules={[{ required: true, message: 'Nhập tên' }]}><Input /></Form.Item>
          <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true, message: 'Nhập SĐT' }]}><Input /></Form.Item>
          <Form.Item name="email" label="Email"><Input /></Form.Item>
          <Form.Item name="source" label="Nguồn"><Input /></Form.Item>
          <Form.Item name="status" label="Trạng thái" initialValue="new">
            <Select options={Object.entries(LEAD_STATUS).map(([value, cfg]) => ({ value, label: cfg.label }))} />
          </Form.Item>
        </Form>
      </Modal>
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
