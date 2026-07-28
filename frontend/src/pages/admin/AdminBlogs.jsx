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

export function AdminBlogs() {
  const navigate = useNavigate()
  const [mainTab, setMainTab] = useState('blogs')

  return (
    <>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#0f172a' }}>Quản lý bài viết</h1>
          <p style={{ margin: 0, color: '#64748b' }}>Quản lý bài viết, danh mục và thẻ trên website</p>
        </div>
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          onClick={() => {
            if (mainTab === 'blogs') navigate('/admin/blogs/editor');
            if (mainTab === 'categories') {
              window.dispatchEvent(new Event('openAddCategoryModal'))
            }
          }}
          style={{ background: '#0d9488', borderRadius: 8 }}
        >
          {mainTab === 'categories' ? 'Thêm danh mục mới' : 'Viết bài mới'}
        </Button>
      </div>

      <Tabs
        activeKey={mainTab}
        onChange={setMainTab}
        items={[
          { key: 'blogs', label: 'Tất cả bài viết', children: <BlogsView /> },
          { key: 'categories', label: 'Danh mục', children: <CategoriesView /> },
          { key: 'tags', label: 'Thẻ', children: <BlogTagsTable /> }
        ]}
      />
    </>
  )
}


function BlogsView() {
  const { message } = App.useApp()
  const navigate = useNavigate()
  const [tab, setTab] = useState('all')
  const { search, onSearch, debounced, page, setPage, pageSize } = useListParams()
  const status = tab === 'all' ? undefined : tab

  const query = useApiQuery(
    () => blogsService.getBlogs({ status, search: debounced || undefined, page, limit: pageSize }),
    [status, debounced, page]
  )
  const statsQuery = useApiQuery(() => blogsService.getStats(), [])
  const stats = statsQuery.data || { totalBlogs: 0, publishedBlogs: 0, pendingBlogs: 0, totalViews: 0 }

  const rows = query.data?.items || []
  const total = query.data?.pagination?.total || 0

  const doAction = async (fn, msg) => {
    try { await fn(); message.success(msg); query.refetch() } catch { message.error('Thao tác thất bại') }
  }

  const columns = [
    { title: 'Tiêu đề', dataIndex: 'title', key: 'title', render: (v) => <span className="cell-strong">{v}</span> },
    { title: 'Danh mục', dataIndex: 'category', key: 'category', render: (c) => c?.name || '-' },
    { title: 'Lượt xem', dataIndex: 'views', key: 'views', render: (v) => <Space><EyeOutlined style={{ color: '#94a3b8' }} /> {v?.toLocaleString('vi-VN') || 0}</Space> },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: (v) => <StatusTag map={BLOG_STATUS} value={v} /> },
    { title: 'Ngày tạo', dataIndex: 'createdAt', key: 'createdAt', render: (v) => formatDate(v) },
    {
      title: 'Thao tác', key: 'action', render: (_, r) => (
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
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="kpi-card">
          <div className="kpi-card-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}><FileTextOutlined /></div>
          <div className="kpi-card-content">
            <span className="label">Tổng bài viết</span>
            <span className="value">{stats.totalBlogs}</span>
            <span className="sub">Bài viết</span>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-card-icon" style={{ background: '#dcfce7', color: '#16a34a' }}><CheckCircleOutlined /></div>
          <div className="kpi-card-content">
            <span className="label">Đã đăng</span>
            <span className="value">{stats.publishedBlogs}</span>
            <span className="sub">Bài viết</span>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-card-icon" style={{ background: '#fef3c7', color: '#d97706' }}><ClockCircleOutlined /></div>
          <div className="kpi-card-content">
            <span className="label">Chờ duyệt</span>
            <span className="value">{stats.pendingBlogs}</span>
            <span className="sub">Bài viết</span>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-card-icon" style={{ background: '#f1f5f9', color: '#475569' }}><EyeOutlined /></div>
          <div className="kpi-card-content">
            <span className="label">Tổng lượt xem</span>
            <span className="value">{stats.totalViews.toLocaleString('vi-VN')}</span>
            <span className="sub">Lượt xem</span>
          </div>
        </div>
      </div>

      <div className="admin-card" style={{ padding: 0 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <Segmented
            options={[
              { label: `Tất cả (${stats.totalBlogs})`, value: 'all' },
              { label: `Chờ duyệt (${stats.pendingBlogs})`, value: 'pending' },
              { label: `Đã đăng (${stats.publishedBlogs})`, value: 'published' }
            ]}
            value={tab}
            onChange={(v) => { setTab(v); setPage(1) }}
          />
          <Input.Search allowClear placeholder="Tìm kiếm bài viết..." value={search} onChange={(e) => onSearch(e.target.value)} style={{ width: 260 }} />
          <Button style={{ marginLeft: 'auto' }}>Bộ lọc</Button>
        </div>
        {query.error && <Alert type="error" showIcon title={query.error} style={{ margin: 16 }} />}
        <Table rowKey="_id" loading={query.loading} columns={columns} dataSource={rows}
          pagination={{ current: page, pageSize, total, onChange: setPage, showSizeChanger: false }} />
      </div>
    </>
  )
}

function BlogTagsTable() {
  const { message } = App.useApp()
  const [editing, setEditing] = useState(null)
  const [form] = Form.useForm()
  const { search, onSearch, debounced, page, setPage, pageSize } = useListParams()

  const query = useApiQuery(
    () => blogTagsService.getTags({ search: debounced || undefined, page, limit: pageSize }),
    [debounced, page]
  )

  const rows = query.data?.items || []
  const total = query.data?.total || 0

  const handleEdit = (tag) => {
    setEditing(tag)
    form.setFieldsValue(tag)
  }

  const handleDelete = async (id) => {
    try {
      await blogTagsService.deleteTag(id)
      message.success('Đã xóa thẻ')
      query.refetch()
    } catch (e) {
      message.error(e?.response?.data?.message || e?.error?.message || 'Không thể xóa thẻ')
    }
  }

  const submit = async (values) => {
    try {
      if (editing?._id) await blogTagsService.updateTag(editing._id, values)
      else await blogTagsService.createTag(values)
      message.success('Đã lưu thẻ')
      setEditing(null)
      form.resetFields()
      query.refetch()
    } catch (e) {
      message.error(e?.response?.data?.message || e?.error?.message || 'Lỗi khi lưu thẻ')
    }
  }

  const handleCancel = () => {
    setEditing(null)
    form.resetFields()
  }

  const columns = [
    { title: 'Tên thẻ', dataIndex: 'name', key: 'name', render: (val) => <><Tag icon={<SettingOutlined />} color="cyan">{val}</Tag></> },
    { title: 'Slug', dataIndex: 'slug', key: 'slug' },
    { title: 'Bài viết', dataIndex: 'postCount', key: 'postCount', align: 'center', width: 100 },
    { title: 'Ngày tạo', dataIndex: 'createdAt', key: 'createdAt', render: (val) => formatDate(val) },
    { title: 'Thao tác', key: 'actions', width: 120, render: (_, r) => (
      <Space>
        <Button size="small" type="text" icon={<SettingOutlined style={{color: '#0d9488'}} />} onClick={() => handleEdit(r)} />
        <Popconfirm title="Xoá thẻ này?" onConfirm={() => handleDelete(r._id)}>
          <Button size="small" type="text" danger icon={<CloseOutlined />} />
        </Popconfirm>
      </Space>
    )}
  ]

  return (
    <Row gutter={24}>
      <Col xs={24} lg={15}>
        <Card bodyStyle={{ padding: 0 }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: 16 }}>
            <Input.Search allowClear placeholder="Tìm kiếm thẻ..." value={search} onChange={(e) => onSearch(e.target.value)} style={{ maxWidth: 300 }} />
          </div>
          {query.error && <Alert type="error" showIcon title={query.error} style={{ margin: 16 }} />}
          <Table rowKey="_id" loading={query.loading} columns={columns} dataSource={rows}
            pagination={{ current: page, pageSize, total, onChange: setPage, showSizeChanger: false }} />
        </Card>
      </Col>
      <Col xs={24} lg={9}>
        <Card title={editing ? 'Sửa thẻ' : 'Thêm thẻ mới'}>
          <Form form={form} layout="vertical" onFinish={submit}>
            <Form.Item name="name" label="Tên thẻ" rules={[{ required: true, message: 'Nhập tên thẻ' }]}>
              <Input placeholder="Nhập tên thẻ" />
            </Form.Item>
            <Form.Item name="slug" label="Slug" extra="Slug sẽ được tạo tự động từ tên thẻ. Bạn có thể chỉnh sửa.">
              <Input placeholder="slug-the-viet-lien-khong-dau" />
            </Form.Item>
            <Form.Item name="description" label="Mô tả">
              <Input.TextArea rows={4} placeholder="Nhập mô tả thẻ (không bắt buộc)" />
            </Form.Item>

            <Form.Item label="SEO Preview" style={{ marginBottom: 24 }}>
              <div style={{ color: '#0d9488', fontSize: 14, marginBottom: 4, wordBreak: 'break-all' }}>
                https://www.losa247.vn/tag/{Form.useWatch('slug', form) || 'slug-tu-dong'}
              </div>
              <div style={{ color: '#64748b', fontSize: 12 }}>
                Đây là đường dẫn hiển thị trên website.
              </div>
            </Form.Item>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <Button onClick={handleCancel}>Hủy</Button>
              <Button type="primary" htmlType="submit" style={{ background: '#0d9488' }}>Lưu thẻ</Button>
            </div>
          </Form>
        </Card>
      </Col>
    </Row>
  )
}

function CategoriesView() {
  const { message } = App.useApp()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCat, setEditingCat] = useState(null)
  const [form] = Form.useForm()

  const query = useApiQuery(() => blogCategoriesService.getCategories(), [])
  const statsQuery = useApiQuery(() => blogsService.getStats(), [])
  const rows = query.data?.items || []
  const stats = statsQuery.data || { totalBlogs: 0 }

  useEffect(() => {
    const handleOpen = () => {
      setEditingCat(null)
      form.resetFields()
      setIsModalOpen(true)
    }
    window.addEventListener('openAddCategoryModal', handleOpen)
    return () => window.removeEventListener('openAddCategoryModal', handleOpen)
  }, [form])

  const handleEdit = (cat) => {
    setEditingCat(cat)
    form.setFieldsValue({ name: cat.name })
    setIsModalOpen(true)
  }

  const handleDelete = async (id) => {
    try {
      await blogCategoriesService.deleteCategory(id)
      message.success('Đã xoá danh mục')
      query.refetch()
    } catch {
      message.error('Không xoá được danh mục')
    }
  }

  const handleSubmit = async (values) => {
    try {
      if (editingCat) {
        await blogCategoriesService.updateCategory(editingCat._id, values)
        message.success('Cập nhật thành công')
      } else {
        await blogCategoriesService.createCategory(values)
        message.success('Thêm mới thành công')
      }
      setIsModalOpen(false)
      query.refetch()
    } catch (e) {
      message.error(e?.error?.message || 'Có lỗi xảy ra')
    }
  }

  const columns = [
    { title: '#', key: 'index', render: (_, __, i) => i + 1, width: 60 },
    { title: 'TÊN DANH MỤC', dataIndex: 'name', key: 'name', render: (v) => <b>{v}</b> },
    { title: 'SLUG', dataIndex: 'slug', key: 'slug', render: (v) => <span style={{ color: '#64748b' }}>{v}</span> },
    { title: 'SỐ BÀI VIẾT', dataIndex: 'blogCount', key: 'blogCount', render: (v) => <b>{v || 0}</b> },
    { title: 'NGÀY TẠO', dataIndex: 'createdAt', key: 'createdAt', render: (v) => formatDate(v) },
    {
      title: 'THAO TÁC', key: 'action', render: (_, r) => (
        <Space>
          <Button size="small" onClick={() => handleEdit(r)}>Sửa</Button>
          <Popconfirm title="Xoá danh mục này?" onConfirm={() => handleDelete(r._id)}>
            <Button size="small" danger>Xoá</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <>
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
        <div className="kpi-card">
          <div className="kpi-card-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}><FileTextOutlined /></div>
          <div className="kpi-card-content">
            <span className="label">Tổng danh mục</span>
            <span className="value">{rows.length}</span>
            <span className="sub">Danh mục</span>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-card-icon" style={{ background: '#f5f3ff', color: '#8b5cf6' }}><FileTextOutlined /></div>
          <div className="kpi-card-content">
            <span className="label">Tổng bài viết</span>
            <span className="value">{stats.totalBlogs}</span>
            <span className="sub">Bài viết</span>
          </div>
        </div>
      </div>

      <div className="admin-card" style={{ padding: 0 }}>
        <Table rowKey="_id" loading={query.loading} columns={columns} dataSource={rows} pagination={false} />
      </div>

      <Modal
        title={editingCat ? "Cập nhật danh mục" : "Thêm danh mục mới"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="name" label="Tên danh mục" rules={[{ required: true, message: 'Vui lòng nhập tên danh mục' }]}>
            <Input placeholder="VD: Marketing" />
          </Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <Button onClick={() => setIsModalOpen(false)}>Huỷ</Button>
            <Button type="primary" htmlType="submit">Lưu lại</Button>
          </div>
        </Form>
      </Modal>
    </>
  )
}

