import { useEffect, useMemo, useState } from 'react'
import {
  Alert, App, Avatar, Button, Checkbox, Form, Input, Modal, Popconfirm, Select,
  Space, Switch, Table, Tag, Typography,
} from 'antd'
import {
  CheckCircleFilled, ClockCircleOutlined, CrownOutlined, LockOutlined, MailOutlined,
  PlusOutlined, ReloadOutlined, SafetyCertificateOutlined, SearchOutlined,
  TeamOutlined, UserOutlined, UserSwitchOutlined,
} from '@ant-design/icons'
import { useApiQuery } from '../../hooks/useApiQuery'
import { useListParams } from '../../hooks/useListParams'
import { formatDate } from '../../utils/format'
import { usersService, rolesService } from '../../features/users/usersService'
import { useAuthStore } from '../../stores/authStore'
import '../../styles/admin/users.css'

const { Title, Text } = Typography

const RESOURCE_LABELS = {
  dashboard: 'Tổng quan', leads: 'Khách hàng tiềm năng', blogs: 'Bài viết', faqs: 'Câu hỏi thường gặp',
  pricing: 'Gói dịch vụ', chat: 'Trò chuyện', users: 'Người dùng', roles: 'Vai trò', settings: 'Cài đặt',
  apiConfigs: 'Cấu hình API', logs: 'Nhật ký', notifications: 'Thông báo',
}

const ACTION_LABELS = {
  view: 'Xem', create: 'Tạo mới', update: 'Cập nhật', delete: 'Xóa', assign: 'Gán', export: 'Xuất dữ liệu',
  publish: 'Xuất bản', reply: 'Phản hồi', lock: 'Khóa tài khoản',
}

const roleMeta = (role) => ({
  admin: { label: 'Super Admin', className: 'role-admin', icon: <CrownOutlined /> },
  editor: { label: 'Biên tập viên', className: 'role-editor', icon: <SafetyCertificateOutlined /> },
  customer: { label: 'Khách hàng', className: 'role-customer', icon: <UserOutlined /> },
}[role] || { label: role || 'Chưa gán', className: 'role-default', icon: <UserSwitchOutlined /> })

const initials = (name = '') => name.trim().split(/\s+/).slice(-2).map((part) => part[0]).join('').toUpperCase() || 'U'

export function AdminUsers() {
  const [activeTab, setActiveTab] = useState('admin')

  return (
    <main className="users-page">
      <header className="users-page-header">
        <div>
          <span className="users-section-label"><TeamOutlined /> Quản trị truy cập</span>
          <Title level={3}>Người dùng & phân quyền</Title>
          <Text>Quản lý tài khoản, vai trò và quyền truy cập trong toàn bộ hệ thống.</Text>
        </div>
      </header>

      <nav className="users-tabs" aria-label="Khu vực quản lý người dùng">
        {[
          { key: 'admin', label: 'Quản trị viên', icon: <SafetyCertificateOutlined /> },
          { key: 'client', label: 'Khách hàng', icon: <TeamOutlined /> },
          { key: 'permissions', label: 'Ma trận quyền', icon: <LockOutlined /> },
        ].map((tab) => (
          <button id={`users-tab-${tab.key}`} key={tab.key} type="button"
            className={activeTab === tab.key ? 'active' : ''} onClick={() => setActiveTab(tab.key)}>
            {tab.icon}<span>{tab.label}</span>
          </button>
        ))}
      </nav>

      {activeTab === 'permissions'
        ? <PermissionsTab />
        : <UsersTab key={activeTab} type={activeTab} />}
    </main>
  )
}

function UsersTab({ type }) {
  const { message } = App.useApp()
  const [open, setOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [roleFilter, setRoleFilter] = useState()
  const [form] = Form.useForm()
  const { search, onSearch, debounced, page, setPage, pageSize } = useListParams()
  const query = useApiQuery(
    () => usersService.getUsers({ search: debounced || undefined, page, limit: pageSize, type, role: roleFilter }),
    [debounced, page, type, roleFilter],
  )
  const rolesQuery = useApiQuery(() => rolesService.getRoles(), [])
  const rolesList = Array.isArray(rolesQuery.data) ? rolesQuery.data : []
  const rows = query.data?.items || []
  const total = query.data?.pagination?.total || 0
  const activeCount = rows.filter((row) => row.status === 'active').length
  const lockedCount = rows.filter((row) => row.status === 'locked').length
  const visibleRoles = new Set(rows.map((row) => row.role)).size

  const closeModal = () => { setOpen(false); form.resetFields() }
  const toggleStatus = async (row, checked) => {
    try {
      await usersService.updateUser(row._id, { status: checked ? 'active' : 'locked' })
      message.success(checked ? 'Đã kích hoạt tài khoản' : 'Đã khóa tài khoản')
      query.refetch()
    } catch (error) { message.error(error?.error?.message || 'Không cập nhật được trạng thái') }
  }
  const createUser = async () => {
    try {
      const values = await form.validateFields()
      setCreating(true)
      await usersService.createUser(values)
      message.success('Đã tạo tài khoản mới')
      closeModal()
      query.refetch()
    } catch (error) {
      if (!error?.errorFields) message.error(error?.error?.message || 'Không tạo được tài khoản')
    } finally { setCreating(false) }
  }

  const columns = [
    {
      title: 'Người dùng', key: 'identity', minWidth: 280,
      render: (_, row) => <div className="user-identity">
        <Avatar size={44} className={`user-avatar avatar-${row.role}`}>{initials(row.name)}</Avatar>
        <div><strong>{row.name || 'Chưa cập nhật tên'}</strong><span><MailOutlined /> {row.email}</span></div>
      </div>,
    },
    {
      title: 'Vai trò', dataIndex: 'role', key: 'role', width: 180,
      render: (role) => { const meta = roleMeta(role); return <span className={`user-role ${meta.className}`}>{meta.icon}{meta.label}</span> },
    },
    {
      title: 'Ngày tham gia', dataIndex: 'createdAt', key: 'createdAt', width: 170,
      render: (value) => <span className="user-date"><ClockCircleOutlined />{value ? formatDate(value) : 'Chưa có dữ liệu'}</span>,
    },
    {
      title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 190,
      render: (status, row) => <div className="user-status-control">
        <span className={`user-status ${status === 'active' ? 'is-active' : 'is-locked'}`}>
          <i />{status === 'active' ? 'Đang hoạt động' : 'Đã bị khóa'}
        </span>
        <Switch size="small" checked={status === 'active'} onChange={(checked) => toggleStatus(row, checked)} />
      </div>,
    },
  ]

  const roleOptions = rolesList
    .filter((role) => type === 'client' ? role.name === 'customer' : role.name !== 'customer')
    .map((role) => ({ value: role.name, label: roleMeta(role.name).label }))
  const createRoleOptions = roleOptions.length ? roleOptions : [{ value: type === 'client' ? 'customer' : 'editor', label: type === 'client' ? 'Khách hàng' : 'Biên tập viên' }]

  return <section className="users-panel">
    <div className="users-kpi-grid">
      <UserKpi icon={<TeamOutlined />} tone="teal" label="Tổng tài khoản" value={total} note={type === 'admin' ? 'Nhân sự quản trị' : 'Khách hàng hệ thống'} />
      <UserKpi icon={<CheckCircleFilled />} tone="green" label="Đang hoạt động" value={activeCount} note="Trong trang hiện tại" />
      <UserKpi icon={<LockOutlined />} tone="orange" label="Tài khoản khóa" value={lockedCount} note="Cần kiểm tra quyền truy cập" />
      <UserKpi icon={<SafetyCertificateOutlined />} tone="violet" label="Vai trò hiển thị" value={visibleRoles} note={`${rolesList.length} vai trò trong hệ thống`} />
    </div>

    <div className="users-table-card">
      <div className="users-toolbar">
        <div className="users-toolbar-copy">
          <strong>{type === 'admin' ? 'Danh sách quản trị viên' : 'Danh sách khách hàng'}</strong>
          <span>{total} tài khoản được tìm thấy</span>
        </div>
        <div className="users-toolbar-actions">
          <Input id="users-search-input" allowClear prefix={<SearchOutlined />} placeholder="Tìm theo tên hoặc email..."
            value={search} onChange={(event) => onSearch(event.target.value)} />
          <Select id="users-role-filter" allowClear placeholder="Tất cả vai trò" value={roleFilter}
            onChange={(value) => { setRoleFilter(value); setPage(1) }} options={roleOptions} />
          <Button id="users-refresh-button" icon={<ReloadOutlined />} loading={query.loading} onClick={query.refetch}>Tải lại</Button>
          <Button id="users-add-button" type="primary" icon={<PlusOutlined />} onClick={() => setOpen(true)}>Thêm tài khoản</Button>
        </div>
      </div>

      {query.error && <Alert type="error" showIcon message={query.error} className="users-error" />}
      <Table className="users-table" rowKey="_id" loading={query.loading} columns={columns} dataSource={rows}
        scroll={{ x: 900 }} locale={{ emptyText: <div className="users-empty"><TeamOutlined /><strong>Chưa tìm thấy tài khoản</strong><span>Thử thay đổi từ khóa hoặc bộ lọc của bạn.</span></div> }}
        pagination={{ current: page, pageSize, total, onChange: setPage, showSizeChanger: false,
          showTotal: (count) => `Tổng ${count} tài khoản` }} />
    </div>

    <Modal className="users-modal" title={null} open={open} onCancel={closeModal} destroyOnHidden footer={null} width={520}>
      <div className="users-modal-header"><span><PlusOutlined /></span><div><Title level={4}>Thêm tài khoản mới</Title><Text>Tạo quyền truy cập mới cho {type === 'admin' ? 'nhân sự quản trị' : 'khách hàng'}.</Text></div></div>
      <Form form={form} layout="vertical" requiredMark={false} className="users-form">
        <Form.Item name="name" label="Họ và tên" rules={[{ required: true, message: 'Vui lòng nhập họ tên' }, { min: 2, message: 'Tên cần ít nhất 2 ký tự' }]}>
          <Input prefix={<UserOutlined />} placeholder="Ví dụ: Nguyễn Minh Anh" />
        </Form.Item>
        <Form.Item name="email" label="Email đăng nhập" rules={[{ required: true, type: 'email', message: 'Email không hợp lệ' }]}>
          <Input prefix={<MailOutlined />} placeholder="name@company.com" />
        </Form.Item>
        <Form.Item name="password" label="Mật khẩu khởi tạo" rules={[{ required: true, min: 6, message: 'Mật khẩu tối thiểu 6 ký tự' }]}>
          <Input.Password prefix={<LockOutlined />} placeholder="Tối thiểu 6 ký tự" />
        </Form.Item>
        <Form.Item name="role" label="Vai trò" initialValue={createRoleOptions[0]?.value}>
          <Select options={createRoleOptions} />
        </Form.Item>
      </Form>
      <div className="users-modal-actions"><Button id="users-modal-cancel" onClick={closeModal}>Hủy</Button><Button id="users-modal-submit" type="primary" icon={<PlusOutlined />} loading={creating} onClick={createUser}>Tạo tài khoản</Button></div>
    </Modal>
  </section>
}

function UserKpi({ icon, tone, label, value, note }) {
  return <article className="users-kpi"><span className={`users-kpi-icon ${tone}`}>{icon}</span><div><span>{label}</span><strong>{value}</strong><small>{note}</small></div></article>
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
  const addRole = async () => {
    try {
      const values = await form.validateFields()
      await rolesService.createRole({ name: values.name, permissions: [] })
      message.success('Đã thêm vai trò'); setOpen(false); form.resetFields(); rolesQuery.refetch()
    } catch (error) { if (!error?.errorFields) message.error(error?.error?.message || 'Không thêm được vai trò') }
  }

  const columns = [
    { title: 'Phân quyền', dataIndex: 'label', key: 'label', width: 280, fixed: 'left', render: (label, row) => row.isModule
      ? <span className="permission-module"><SafetyCertificateOutlined />{label}</span>
      : <span className="permission-action">{label}</span> },
    ...roles.map((role) => ({
      title: <div className="permission-role-head"><span className={`user-role ${roleMeta(role.name).className}`}>{roleMeta(role.name).icon}{roleMeta(role.name).label}</span>
        {role.name === 'admin' && <Tag color="gold">Hệ thống</Tag>}
        {role.name !== 'admin' && canDelete && <Popconfirm title="Xóa vai trò này?" description="Chỉ xóa được khi chưa có người dùng." onConfirm={() => deleteRole(role)}><Button size="small" type="text" danger>Xóa</Button></Popconfirm>}
      </div>,
      key: role._id, align: 'center', width: 170,
      render: (_, row) => row.isModule ? null : <Checkbox aria-label={`${role.name} - ${row.permission}`}
        checked={role.name === 'admin' || draftFor(role).includes(row.permission)} disabled={role.name === 'admin' || !canUpdate || saving}
        onChange={(event) => togglePerm(role, row.permission, event.target.checked)} />,
    })),
  ]
  const dataSource = catalog.flatMap((group) => [
    { key: `header.${group.resource}`, label: RESOURCE_LABELS[group.resource] || group.resource, isModule: true },
    ...(group.permissions || []).map((permission) => ({ key: permission, permission, label: ACTION_LABELS[permission.split('.')[1]] || permission.split('.')[1], isModule: false })),
  ])

  return <section className="permissions-panel">
    <div className="permissions-hero">
      <span className="permissions-hero-icon"><LockOutlined /></span>
      <div><strong>Kiểm soát quyền truy cập</strong><p>Thiết lập chính xác hành động mỗi vai trò được phép thực hiện. Super Admin luôn có toàn quyền.</p></div>
      <div className="permissions-summary"><span><b>{roles.length}</b> vai trò</span><span className={dirtyCount ? 'has-changes' : ''}><b>{dirtyCount}</b> thay đổi</span></div>
    </div>
    {(rolesQuery.error || catalogQuery.error) && <Alert type="error" showIcon message={rolesQuery.error || catalogQuery.error} />}
    <div className="permissions-card">
      <div className="permissions-card-header"><div><strong>Ma trận phân quyền</strong><span>Bật hoặc tắt quyền theo từng vai trò</span></div>
        <Space><Button icon={<ReloadOutlined />} loading={rolesQuery.loading || catalogQuery.loading} onClick={() => { rolesQuery.refetch(); catalogQuery.refetch() }}>Tải lại</Button>
          {canCreate && <Button id="roles-add-button" type="primary" icon={<PlusOutlined />} onClick={() => setOpen(true)}>Thêm vai trò</Button>}</Space>
      </div>
      <Table className="permissions-table" rowKey="key" pagination={false} columns={columns} dataSource={dataSource}
        loading={rolesQuery.loading || catalogQuery.loading} scroll={{ x: Math.max(900, 280 + roles.length * 170) }} />
    </div>
    {canUpdate && <div className={`permissions-savebar ${dirtyCount ? 'is-visible' : ''}`}><div><strong>{dirtyCount ? `${dirtyCount} thay đổi chưa lưu` : 'Mọi thay đổi đã được lưu'}</strong><span>Kiểm tra kỹ trước khi cập nhật quyền truy cập.</span></div><Space><Button disabled={!dirtyRoles.length || saving} onClick={resetDraft}>Hủy thay đổi</Button><Button type="primary" loading={saving} disabled={!dirtyRoles.length} onClick={saveDraft}>Cập nhật quyền ({dirtyCount})</Button></Space></div>}

    <Modal className="users-modal" title={null} open={open} onCancel={() => { setOpen(false); form.resetFields() }} footer={null} destroyOnHidden width={480}>
      <div className="users-modal-header"><span><SafetyCertificateOutlined /></span><div><Title level={4}>Thêm vai trò mới</Title><Text>Tạo nhóm quyền mới cho đội ngũ vận hành.</Text></div></div>
      <Form form={form} layout="vertical" requiredMark={false} className="users-form"><Form.Item name="name" label="Tên định danh vai trò"
        rules={[{ required: true, message: 'Vui lòng nhập tên vai trò' }, { pattern: /^[a-zA-Z][a-zA-Z0-9_-]{1,31}$/, message: 'Dùng 2-32 ký tự chữ, số, _ hoặc -' }]}>
        <Input prefix={<SafetyCertificateOutlined />} placeholder="Ví dụ: marketing, ketoan" autoFocus />
      </Form.Item></Form>
      <div className="users-modal-actions"><Button onClick={() => { setOpen(false); form.resetFields() }}>Hủy</Button><Button id="roles-modal-submit" type="primary" icon={<PlusOutlined />} onClick={addRole}>Tạo vai trò</Button></div>
    </Modal>
  </section>
}
