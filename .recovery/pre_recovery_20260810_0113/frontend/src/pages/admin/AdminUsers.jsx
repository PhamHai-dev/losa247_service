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

const PERM_MODULES = ['leads', 'orders', 'blogs', 'faqs', 'chat', 'logs', 'users', 'roles']
const PERM_ACTIONS = ['view', 'create', 'update', 'delete']

function PermissionsTab() {
  const { message } = App.useApp()
  const [open, setOpen] = useState(false)
  const [form] = Form.useForm()
  const query = useApiQuery(() => rolesService.getRoles(), [])
  const roles = Array.isArray(query.data) ? query.data : []

  const togglePerm = async (role, permStr, checked) => {
    let newPerms = [...role.permissions]
    if (checked) newPerms.push(permStr)
    else newPerms = newPerms.filter(p => p !== permStr)

    try {
      await rolesService.updateRole(role._id, { permissions: newPerms })
      message.success('Đã lưu')
      query.refetch()
    } catch {
      message.error('Lỗi khi lưu quyền')
    }
  }

  const deleteRole = async (roleId) => {
    try {
      await rolesService.deleteRole(roleId)
      message.success('Đã xoá vai trò')
      query.refetch()
    } catch {
      message.error('Lỗi khi xoá')
    }
  }

  const columns = [
    { title: 'Phân quyền', dataIndex: 'name', key: 'name', width: 250 },
    ...roles.map(role => ({
      title: (
        <Space>
          {role.name}
          <Popconfirm title="Xoá vai trò này?" onConfirm={() => deleteRole(role._id)}>
            <Button size="small" type="text" danger>Xoá</Button>
          </Popconfirm>
        </Space>
      ),
      key: role.name,
      align: 'center',
      render: (_, row) => {
        if (row.isModule) return null
        const hasPerm = role.permissions.includes(row.key)
        return <Switch size="small" checked={hasPerm} onChange={(c) => togglePerm(role, row.key, c)} />
      }
    }))
  ]

  const dataSource = [];
  PERM_MODULES.forEach(m => {
    dataSource.push({
      key: `header_${m}`,
      name: <span style={{ color: '#0050b3', fontWeight: 700, fontSize: '1.05em', textTransform: 'uppercase' }}>{m}</span>,
      isModule: true,
    });
    PERM_ACTIONS.forEach(act => {
      dataSource.push({
        key: `${m}_${act}`,
        name: <span style={{ marginLeft: 24, color: '#595959' }}>{act.charAt(0).toUpperCase() + act.slice(1)}</span>,
        isModule: false,
      });
    });
  });

  const addRole = async () => {
    try {
      const values = await form.validateFields()
      await rolesService.createRole({ name: values.name })
      message.success('Đã thêm vai trò')
      setOpen(false)
      form.resetFields()
      query.refetch()
    } catch (e) {
      if (e?.errorFields) return; // Validation error
      message.error(e?.error?.message || 'Lỗi thêm vai trò')
    }
  }

  return (
    <>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <Button type="primary" size="middle" icon={<PlusOutlined />} onClick={() => setOpen(true)}>Thêm vai trò</Button>
      </div>
      <Table rowKey="key"
        pagination={false}
        columns={columns}
        dataSource={dataSource}
        loading={query.loading}
      />

      <Modal title="Thêm vai trò mới" open={open} onOk={addRole} onCancel={() => setOpen(false)} destroyOnHidden>
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Tên vai trò"
            rules={[{ required: true, message: 'Vui lòng nhập tên vai trò' }]}
          >
            <Input placeholder="Ví dụ: marketing, ketoan..." autoFocus />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

// ---- Settings -------------------------------------------------------------
