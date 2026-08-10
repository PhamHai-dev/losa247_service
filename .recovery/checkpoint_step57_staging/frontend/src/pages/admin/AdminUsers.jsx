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
  dashboard: 'Dashboard', leads: 'Lead', blogs: 'Bài viết', faqs: 'Hỏi đáp',
  pricing: 'Gói dịch vụ', chat: 'Chat', users: 'Người dùng', roles: 'Ma trận quyền',
  settings: 'Cấu hình', apiConfigs: 'Cấu hình API', logs: 'Nhật ký', notifications: 'Thông báo',
}
const ACTION_LABELS = {
  view: 'View', create: 'Create', update: 'Update', delete: 'Delete', assign: 'Assign',
  export: 'Export', publish: 'Publish', reply: 'Reply', lock: 'Lock',
}

function PermissionsTab() {
  const { message } = App.useApp()
  const hasPermission = useAuthStore((state) => state.hasPermission)
  const [open, setOpen] = useState(false)
  const [draftPermissions, setDraftPermissions] = useState({})
  const [saving, setSaving] = useState(false)
  const [form] = Form.useForm()
  const rolesQuery = useApiQuery(() => rolesService.getRoles(), [])
  const catalogQuery = useApiQuery(() => rolesService.getPermissionCatalog(), [])
  const roles = Array.isArray(rolesQuery.data) ? rolesQuery.data : []
  const catalog = catalogQuery.data && typeof catalogQuery.data === 'object' ? catalogQuery.data : {}
  const validPermissions = useMemo(() => new Set(Object.values(catalog).flat()), [catalog])
  const canCreate = hasPermission('roles.create')
  const canUpdate = hasPermission('roles.update')
  const canDelete = hasPermission('roles.delete')

  const buildDraft = () => Object.fromEntries(roles.map((role) => [
    role._id,
    (role.permissions || []).filter((permission) => validPermissions.has(permission)),
  ]))

  useEffect(() => {
    if (roles.length && validPermissions.size) setDraftPermissions(buildDraft())
  }, [rolesQuery.data, catalogQuery.data])

  const rows = Object.entries(catalog).flatMap(([resource, permissions]) => [
    { key: `group:${resource}`, resource, isGroup: true },
    ...permissions.map((permission) => ({
      key: permission,
      resource,
      permission,
      action: permission.split('.')[1],
      isGroup: false,
    })),
  ])

  const changedRoles = roles.filter((role) => {
    if (role.name === 'admin') return false
    const original = (role.permissions || []).filter((permission) => validPermissions.has(permission)).sort()
    const draft = [...(draftPermissions[role._id] || [])].sort()
    const hadLegacyPermissions = (role.permissions || []).some((permission) => !validPermissions.has(permission) && permission !== '*')
    return hadLegacyPermissions || JSON.stringify(original) !== JSON.stringify(draft)
  })

  const togglePerm = (role, permission, checked) => {
    setDraftPermissions((current) => {
      const rolePermissions = current[role._id] || []
      return {
        ...current,
        [role._id]: checked
          ? [...new Set([...rolePermissions, permission])]
          : rolePermissions.filter((item) => item !== permission),
      }
    })
  }

  const cancelChanges = () => setDraftPermissions(buildDraft())

  const saveChanges = async () => {
    if (!changedRoles.length) return
    setSaving(true)
    try {
      await rolesService.bulkUpdatePermissions(changedRoles.map((role) => ({
        id: role._id,
        permissions: draftPermissions[role._id] || [],
      })))
      message.success(`Đã cập nhật quyền cho ${changedRoles.length} vai trò`)
      await rolesQuery.refetch()
    } catch (error) {
      message.error(error?.error?.message || 'Không thể cập nhật quyền')
    } finally {
      setSaving(false)
    }
  }

  const deleteRole = async (role) => {
    try {
      await rolesService.deleteRole(role._id)
      message.success('Đã xoá vai trò')
      await rolesQuery.refetch()
    } catch (error) {
      message.error(error?.error?.message || 'Không thể xoá vai trò')
    }
  }

  const columns = [
    {
      title: 'Chức năng / quyền', dataIndex: 'permission', key: 'permission', width: 280, fixed: 'left',
      render: (_, row) => row.isGroup
        ? <span style={{ color: '#0050b3', fontWeight: 700 }}>{RESOURCE_LABELS[row.resource] || row.resource}</span>
        : <span style={{ marginLeft: 24 }}>{ACTION_LABELS[row.action] || row.action}</span>,
    },
    ...roles.map((role) => {
      const isAdmin = role.name === 'admin'
      const isSystem = Boolean(role.isSystem) || ['admin', 'customer'].includes(role.name)
      return {
        title: (
          <Space>
            <Tag color={isSystem ? 'blue' : 'default'}>{role.name}</Tag>
            {canDelete && !isSystem && (
              <Popconfirm title="Xoá vai trò này?" description="Role đang được sử dụng sẽ không thể xóa." onConfirm={() => deleteRole(role)}>
                <Button size="small" type="text" danger>Xoá</Button>
              </Popconfirm>
            )}
          </Space>
        ),
        key: role.name,
        align: 'center',
        width: 160,
        render: (_, row) => {
          if (row.isGroup) return null
          const rolePermissions = draftPermissions[role._id] || []
          const checked = isAdmin || rolePermissions.includes(row.permission)
          return <Switch size="small" checked={checked}
            disabled={isAdmin || !canUpdate || saving}
            onChange={(value) => togglePerm(role, row.permission, value)} />
        },
      }
    }),
  ]

  const addRole = async () => {
    try {
      const values = await form.validateFields()
      await rolesService.createRole({ name: values.name, permissions: [] })
      message.success('Đã thêm vai trò')
      setOpen(false)
      form.resetFields()
      await rolesQuery.refetch()
    } catch (error) {
      if (error?.errorFields) return
      message.error(error?.error?.message || 'Không thể thêm vai trò')
    }
  }

  if (rolesQuery.error || catalogQuery.error) {
    return <Alert type="error" showIcon title={rolesQuery.error || catalogQuery.error} />
  }

  return (
    <>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
        {canCreate && <Button type="primary" icon={<PlusOutlined />} onClick={() => setOpen(true)}>Thêm vai trò</Button>}
      </div>
      <Table rowKey="key" pagination={false} columns={columns} dataSource={rows}
        loading={rolesQuery.loading || catalogQuery.loading} scroll={{ x: 'max-content' }} />
      {canUpdate && (
        <div style={{ position: 'sticky', bottom: 0, zIndex: 5, marginTop: 16, padding: '14px 16px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16,
          background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, boxShadow: '0 -4px 16px rgba(15,23,42,0.08)' }}>
          <Text type={changedRoles.length ? 'warning' : 'secondary'}>
            {changedRoles.length ? `${changedRoles.length} vai trò có thay đổi chưa lưu` : 'Chưa có thay đổi'}
          </Text>
          <Space>
            <Button disabled={!changedRoles.length || saving} onClick={cancelChanges}>Hủy thay đổi</Button>
            <Button type="primary" loading={saving} disabled={!changedRoles.length} onClick={saveChanges}>
              Cập nhật quyền{changedRoles.length ? ` (${changedRoles.length})` : ''}
            </Button>
          </Space>
        </div>
      )}

      <Modal title="Thêm vai trò mới" open={open} onOk={addRole} onCancel={() => setOpen(false)} destroyOnHidden>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Tên vai trò" rules={[
            { required: true, message: 'Vui lòng nhập tên vai trò' },
            { pattern: /^[a-zA-Z][a-zA-Z0-9_-]*$/, message: 'Chỉ dùng chữ, số, dấu gạch ngang hoặc gạch dưới' },
          ]}>
            <Input placeholder="Ví dụ: marketing, ketoan..." autoFocus />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

// ---- Settings -------------------------------------------------------------
