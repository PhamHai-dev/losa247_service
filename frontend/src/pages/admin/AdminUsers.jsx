import { useMemo, useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import EmojiPicker from 'emoji-picker-react'
import {
  Alert, App, Button, Card, Checkbox, Col, Descriptions, Drawer, Empty, Form, Input, InputNumber, List,
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
import { useAuthStore } from '../../stores/authStore'
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

export function AdminUsers() {
  return (
    <>
      <PageHeader title="Người dùng & Phân quyền" />
      <Tabs items={[
        { key: 'admin', label: 'Admin', children: <UsersTab type="admin" /> },
        { key: 'client', label: 'User', children: <UsersTab type="client" /> },
        { key: 'permissions', label: 'Ma trận quyền', children: <PermissionsTab /> },
      ]} />
    </>
  )
}

function UsersTab({ type = 'admin' }) {
  const { message } = App.useApp()
  const [open, setOpen] = useState(false)
  const [form] = Form.useForm()
  const { search, onSearch, debounced, page, setPage, pageSize } = useListParams()

  const query = useApiQuery(
    () => usersService.getUsers({ search: debounced || undefined, page, limit: pageSize, type }),
    [debounced, page, type],
  )
  const rolesQuery = useApiQuery(() => rolesService.getRoles(), [])
  const rolesList = Array.isArray(rolesQuery.data) ? rolesQuery.data : []

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
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, alignItems: 'center' }}>
        <Input.Search
          allowClear
          placeholder="Nhập tên hoặc email để tìm kiếm..."
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          style={{ width: 350 }}
          size="large"
        />
        <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => setOpen(true)}>Thêm tài khoản</Button>
      </div>
      {query.error && <Alert type="error" showIcon title={query.error} style={{ marginBottom: 12 }} />}
      <Table rowKey="_id" loading={query.loading} columns={columns} dataSource={rows}
        pagination={{ current: page, pageSize, total, onChange: setPage, showSizeChanger: false }} />

      <Modal title="Thêm tài khoản" open={open} onOk={createUser} onCancel={() => setOpen(false)} destroyOnHidden>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Họ tên" rules={[{ required: true, message: 'Nhập tên' }]}><Input /></Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Email không hợp lệ' }]}><Input /></Form.Item>
          <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, min: 6, message: 'Tối thiểu 6 ký tự' }]}><Input.Password /></Form.Item>
          <Form.Item name="role" label="Vai trò" initialValue="customer">
            <Select options={rolesList.map(r => ({ value: r.name, label: r.name })).concat([{ value: 'customer', label: 'customer' }])} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

const RESOURCE_LABELS = {
  dashboard: 'Tổng quan', leads: 'Khách hàng tiềm năng', blogs: 'Bài viết', faqs: 'Câu hỏi thường gặp',
  pricing: 'Gói dịch vụ', chat: 'Trò chuyện', users: 'Người dùng', roles: 'Vai trò', settings: 'Cài đặt',
  apiConfigs: 'Cấu hình API', logs: 'Nhật ký', notifications: 'Thông báo',
}
const ACTION_LABELS = {
  view: 'View', create: 'Create', update: 'Update', delete: 'Delete', assign: 'Assign', export: 'Export',
  publish: 'Publish', reply: 'Reply', lock: 'Lock',
}

function PermissionsTab() {
  const { message } = App.useApp()
  const hasPermission = useAuthStore((state) => state.hasPermission)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [draft, setDraft] = useState({})
  const [form] = Form.useForm()
  const rolesQuery = useApiQuery(() => rolesService.getRoles(), [])
  const catalogQuery = useApiQuery(() => rolesService.getPermissionCatalog(), [])
  const roles = useMemo(() => Array.isArray(rolesQuery.data) ? rolesQuery.data : [], [rolesQuery.data])
  const catalog = useMemo(() => Array.isArray(catalogQuery.data) ? catalogQuery.data : [], [catalogQuery.data])
  const canCreate = hasPermission('roles.create')
  const canUpdate = hasPermission('roles.update')
  const canDelete = hasPermission('roles.delete')

  useEffect(() => {
    const next = {}
    roles.forEach((role) => { next[role._id] = role.name === 'admin' ? ['*'] : [...new Set(role.permissions || [])] })
    setDraft(next)
  }, [roles])

  const originalFor = (role) => role.name === 'admin' ? ['*'] : [...new Set(role.permissions || [])].sort()
  const draftFor = (role) => [...new Set(draft[role._id] || [])].sort()
  const dirtyRoles = roles.filter((role) => role.name !== 'admin' && JSON.stringify(originalFor(role)) !== JSON.stringify(draftFor(role)))
  const dirtyCount = dirtyRoles.reduce((total, role) => {
    const before = new Set(originalFor(role)); const after = new Set(draftFor(role))
    return total + [...new Set([...before, ...after])].filter((permission) => before.has(permission) !== after.has(permission)).length
  }, 0)

  const togglePerm = (role, permission, checked) => {
    if (!canUpdate || role.name === 'admin') return
    setDraft((current) => {
      const permissions = new Set(current[role._id] || [])
      if (checked) permissions.add(permission); else permissions.delete(permission)
      return { ...current, [role._id]: [...permissions] }
    })
  }

  const resetDraft = () => {
    const next = {}; roles.forEach((role) => { next[role._id] = originalFor(role) }); setDraft(next)
  }

  const saveDraft = async () => {
    if (!dirtyRoles.length) return
    setSaving(true)
    try {
      await rolesService.bulkUpdatePermissions(dirtyRoles.map((role) => ({ roleId: role._id, permissions: draftFor(role) })))
      message.success(`Đã cập nhật ${dirtyRoles.length} vai trò`)
      await rolesQuery.refetch()
    } catch (error) { message.error(error?.error?.message || 'Không cập nhật được ma trận quyền') }
    finally { setSaving(false) }
  }

  const deleteRole = async (role) => {
    try { await rolesService.deleteRole(role._id); message.success('Đã xóa vai trò'); rolesQuery.refetch() }
    catch (error) { message.error(error?.error?.message || 'Không thể xóa vai trò') }
  }

  const columns = [
    { title: 'Phân quyền', dataIndex: 'label', key: 'label', width: 260, fixed: 'left', render: (label, row) => row.isModule
      ? <Text strong style={{ color: '#1677ff' }}>{label}</Text>
      : <span style={{ paddingLeft: 24 }}>{label}</span> },
    ...roles.map((role) => ({
      title: <Space size={4}><Text strong>{role.name}</Text>{role.name === 'admin' && <Tag color="gold">Hệ thống</Tag>}
        {role.name !== 'admin' && canDelete && <Popconfirm title="Xóa vai trò này?" description="Chỉ xóa được khi chưa có người dùng." onConfirm={() => deleteRole(role)}><Button size="small" type="text" danger>Xóa</Button></Popconfirm>}
      </Space>,
      key: role._id, align: 'center', width: 150,
      render: (_, row) => row.isModule ? null : <Checkbox
        aria-label={`${role.name} - ${row.permission}`}
        checked={role.name === 'admin' || draftFor(role).includes(row.permission)}
        disabled={role.name === 'admin' || !canUpdate || saving}
        onChange={(event) => togglePerm(role, row.permission, event.target.checked)} />,
    })),
  ]

  const dataSource = catalog.flatMap((group) => [
    { key: `header.${group.resource}`, label: RESOURCE_LABELS[group.resource] || group.resource, isModule: true },
    ...(group.permissions || []).map((permission) => {
      const action = permission.split('.')[1]
      return { key: permission, permission, label: ACTION_LABELS[action] || action, isModule: false }
    }),
  ])

  const addRole = async () => {
    try {
      const values = await form.validateFields(); await rolesService.createRole({ name: values.name, permissions: [] })
      message.success('Đã thêm vai trò'); setOpen(false); form.resetFields(); rolesQuery.refetch()
    } catch (error) { if (!error?.errorFields) message.error(error?.error?.message || 'Không thêm được vai trò') }
  }

  return <>
    <Alert type="info" showIcon style={{ marginBottom: 16 }} message="Thay đổi được lưu ở bản nháp"
      description="Bật hoặc tắt quyền rồi bấm Cập nhật quyền ở cuối bảng. Vai trò admin luôn có toàn quyền và không thể chỉnh sửa." />
    {(rolesQuery.error || catalogQuery.error) && <Alert type="error" showIcon style={{ marginBottom: 16 }} message={rolesQuery.error || catalogQuery.error} />}
    <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
      <Space><Tag color={dirtyCount ? 'orange' : 'default'}>{dirtyCount} thay đổi chưa lưu</Tag></Space>
      {canCreate && <Button type="primary" icon={<PlusOutlined />} onClick={() => setOpen(true)}>Thêm vai trò</Button>}
    </div>
    <Table rowKey="key" pagination={false} columns={columns} dataSource={dataSource}
      loading={rolesQuery.loading || catalogQuery.loading} scroll={{ x: Math.max(800, 260 + roles.length * 150) }} />
    {canUpdate && <div style={{ position: 'sticky', bottom: 0, zIndex: 5, padding: '16px 0', display: 'flex', justifyContent: 'flex-end', gap: 12, background: 'rgba(255,255,255,.94)', backdropFilter: 'blur(8px)' }}>
      <Button disabled={!dirtyRoles.length || saving} onClick={resetDraft}>Hủy thay đổi</Button>
      <Button type="primary" loading={saving} disabled={!dirtyRoles.length} onClick={saveDraft}>Cập nhật quyền ({dirtyCount})</Button>
    </div>}
    <Modal title="Thêm vai trò mới" open={open} onOk={addRole} onCancel={() => setOpen(false)} destroyOnHidden>
      <Form form={form} layout="vertical"><Form.Item name="name" label="Tên vai trò"
        rules={[{ required: true, message: 'Vui lòng nhập tên vai trò' }, { pattern: /^[a-zA-Z][a-zA-Z0-9_-]{1,31}$/, message: 'Dùng 2-32 ký tự chữ, số, _ hoặc -' }]}>
        <Input placeholder="Ví dụ: marketing, ketoan" autoFocus />
      </Form.Item></Form>
    </Modal>
  </>
}


// ---- Settings -------------------------------------------------------------
