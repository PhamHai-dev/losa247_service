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
  EditOutlined, DeleteOutlined, SearchOutlined, FolderOpenOutlined, TagsOutlined, GlobalOutlined,
  UserOutlined
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
import { blogsService, blogCategoriesService, blogTagsService } from '../../features/blogs/blogsService'
import { faqsService } from '../../features/faqs/faqsService'
import { servicesService } from '../../features/services/servicesService'
import { pricingService } from '../../features/services/pricingService'
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
  const actions = {
    blogs: { label: 'Viết bài mới', run: () => navigate('/admin/blogs/editor') },
    categories: { label: 'Thêm danh mục', run: () => window.dispatchEvent(new Event('openAddCategoryModal')) },
  }
  const action = actions[mainTab]

  return (
    <section className="blogs-page">
      <header className="blogs-page-header">
        <div className="blogs-page-title"><span className="blogs-eyebrow">Trung tâm nội dung</span><Title level={3} className="admin-page-title">Quản lý bài viết</Title><p>Xuất bản nội dung, tổ chức danh mục và tối ưu thư viện thẻ.</p></div>
        {action && <Button type="primary" size="large" icon={<PlusOutlined />} onClick={action.run}>{action.label}</Button>}
      </header>
      <Tabs className="blogs-primary-tabs" activeKey={mainTab} onChange={setMainTab} items={[
        { key: 'blogs', label: <span className="blogs-tab-label"><FileTextOutlined />Bài viết</span>, children: <BlogsView /> },
        { key: 'categories', label: <span className="blogs-tab-label"><FolderOpenOutlined />Danh mục</span>, children: <CategoriesView /> },
        { key: 'tags', label: <span className="blogs-tab-label"><TagsOutlined />Thẻ nội dung</span>, children: <BlogTagsTable /> },
      ]} />
    </section>
  )
}

function BlogsView() {
  const { message } = App.useApp()
  const navigate = useNavigate()
  const [status, setStatus] = useState('')
  const [category, setCategory] = useState('')
  const [source, setSource] = useState('')
  const { search, onSearch, debounced, page, setPage, pageSize } = useListParams()
  const categoriesQuery = useApiQuery(() => blogCategoriesService.getCategories(), [])
  const categories = categoriesQuery.data?.items || []
  const query = useApiQuery(
    () => blogsService.getBlogs({ status: status || undefined, category: category || undefined, source: source || undefined, search: debounced || undefined, page, limit: pageSize }),
    [status, category, source, debounced, page]
  )
  const statsQuery = useApiQuery(() => blogsService.getStats(), [])
  const stats = statsQuery.data || { totalBlogs: 0, publishedBlogs: 0, pendingBlogs: 0, totalViews: 0 }
  const rows = query.data?.items || []
  const total = query.data?.pagination?.total || 0
  const activeFilterCount = [status, category, source, debounced].filter(Boolean).length
  const resetFilters = () => { setStatus(''); setCategory(''); setSource(''); onSearch(''); setPage(1) }
  const doAction = async (fn, msg) => { try { await fn(); message.success(msg); query.refetch(); statsQuery.refetch() } catch { message.error('Thao tác thất bại') } }
  const kpis = [
    { label: 'Tổng bài viết', value: stats.totalBlogs, sub: 'Trong thư viện', icon: <FileTextOutlined />, color: '#0d9488', soft: '#e3f8f4' },
    { label: 'Đã xuất bản', value: stats.publishedBlogs, sub: 'Đang hiển thị', icon: <CheckCircleOutlined />, color: '#16a34a', soft: '#e9f9ee' },
    { label: 'Cần xử lý', value: stats.pendingBlogs, sub: 'Chờ duyệt & bản nháp', icon: <ClockCircleOutlined />, color: '#d97706', soft: '#fff7df' },
    { label: 'Tổng lượt xem', value: Number(stats.totalViews || 0).toLocaleString('vi-VN'), sub: 'Mức độ tiếp cận', icon: <EyeOutlined />, color: '#0284c7', soft: '#e5f5fc' },
  ]
  const sourceOptions = [{ value: 'writer', label: 'Writer' }, { value: 'other', label: 'Khác' }]
  const columns = [
    { title: 'Bài viết', dataIndex: 'title', key: 'title', width: 330, render: (title, row) => <div className="blogs-post-cell"><span className="blogs-post-thumb">{row.coverImageUrl ? <img src={row.coverImageUrl} alt="" /> : <FileTextOutlined />}</span><div className="blogs-post-copy"><strong title={title}>{title}</strong><span>{formatDate(row.createdAt)}</span></div></div> },
    { title: 'Danh mục', dataIndex: 'category', key: 'category', width: 140, render: (item) => item ? <Tag className="blogs-category-chip">{item.name}</Tag> : <span>—</span> },
    { title: 'Nguồn', dataIndex: 'source', key: 'source', width: 115, render: (value) => { const isWriter = value === 'writer' || value === 'manual'; return <span className="blogs-source">{isWriter ? <UserOutlined /> : <GlobalOutlined />}{isWriter ? 'Writer' : 'Khác'}</span> } },
    { title: 'Tác giả', dataIndex: 'author', key: 'author', width: 150, render: (author) => <span className="blogs-source"><UserOutlined />{author?.name || '—'}</span> },
    { title: 'Lượt xem', dataIndex: 'views', key: 'views', width: 105, render: (value) => <span className="blogs-source"><EyeOutlined />{Number(value || 0).toLocaleString('vi-VN')}</span> },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 125, render: (value) => <StatusTag map={BLOG_STATUS} value={value} /> },
    { title: 'Thao tác', key: 'action', fixed: 'right', width: 165, render: (_, row) => <div className="blogs-row-actions">
      <Button type="text" icon={<EyeOutlined />} aria-label={`Xem ${row.title}`} title="Xem bài viết" onClick={() => window.open(`/blog/${row.slug}`, '_blank')} />
      {row.status === 'pending' && <Button type="text" icon={<CheckCircleOutlined />} aria-label={`Duyệt ${row.title}`} title="Duyệt bài" onClick={() => doAction(() => blogsService.approve(row._id), 'Đã duyệt bài')} />}
      {row.status === 'pending' && <Button type="text" danger icon={<CloseOutlined />} aria-label={`Từ chối ${row.title}`} title="Từ chối" onClick={() => doAction(() => blogsService.reject(row._id), 'Đã từ chối')} />}
      <Button type="text" icon={<EditOutlined />} aria-label={`Sửa ${row.title}`} title="Chỉnh sửa" onClick={() => navigate('/admin/blogs/editor', { state: { blog: row } })} />
      <Popconfirm title="Xoá bài viết?" onConfirm={() => doAction(() => blogsService.deleteBlog(row._id), 'Đã xoá')}><Button type="text" danger icon={<DeleteOutlined />} aria-label={`Xóa ${row.title}`} title="Xóa" /></Popconfirm>
    </div> },
  ]

  return <>
    <div className="blogs-kpi-grid">{kpis.map((item) => <article className="blogs-kpi-card" key={item.label} style={{ '--kpi-color': item.color, '--kpi-soft': item.soft }}><span className="blogs-kpi-icon">{item.icon}</span><div className="blogs-kpi-copy"><span>{item.label}</span><strong>{item.value}</strong><small>{item.sub}</small></div></article>)}</div>
    <div className="blogs-content-card">
      <div className="blogs-list-heading"><div><strong>Thư viện bài viết</strong><span>{total} kết quả phù hợp</span></div>{activeFilterCount > 0 && <Tag color="cyan">{activeFilterCount} bộ lọc đang dùng</Tag>}</div>
      <div className="blogs-filter-panel">
        <div className="blogs-filter-grid">
          <Input className="blogs-search" allowClear prefix={<SearchOutlined />} placeholder="Tìm kiếm theo tiêu đề bài viết..." value={search} onChange={(event) => { onSearch(event.target.value); setPage(1) }} />
          <Select allowClear placeholder="Danh mục" value={category || undefined} onChange={(value) => { setCategory(value || ''); setPage(1) }} options={categories.map((item) => ({ value: item._id, label: item.name }))} />
          <Select allowClear placeholder="Nguồn bài viết" value={source || undefined} onChange={(value) => { setSource(value || ''); setPage(1) }} options={sourceOptions} />
          <Select allowClear placeholder="Trạng thái" value={status || undefined} onChange={(value) => { setStatus(value || ''); setPage(1) }} options={Object.entries(BLOG_STATUS).map(([value, item]) => ({ value, label: item.label }))} />
          <Button icon={<ReloadOutlined />} onClick={resetFilters}>Đặt lại</Button>
        </div>
        {activeFilterCount > 0 && <div className="blogs-active-filters"><span>Đang lọc:</span>{debounced && <Tag closable onClose={() => onSearch('')}>“{debounced}”</Tag>}{category && <Tag closable onClose={() => setCategory('')}>{categories.find((item) => item._id === category)?.name}</Tag>}{source && <Tag closable onClose={() => setSource('')}>{sourceOptions.find((item) => item.value === source)?.label}</Tag>}{status && <Tag closable onClose={() => setStatus('')}>{BLOG_STATUS[status]?.label}</Tag>}</div>}
      </div>
      <div className="blogs-status-tabs"><Segmented value={status} onChange={(value) => { setStatus(value); setPage(1) }} options={[{ value: '', label: `Tất cả (${stats.totalBlogs})` }, { value: 'draft', label: 'Bản nháp' }, { value: 'pending', label: 'Chờ duyệt' }, { value: 'published', label: `Đã đăng (${stats.publishedBlogs})` }, { value: 'rejected', label: 'Từ chối' }]} /></div>
      {query.error && <Alert type="error" showIcon title={query.error} style={{ margin:16 }} />}
      <div className="blogs-table-wrap"><Table rowKey="_id" loading={query.loading} columns={columns} dataSource={rows} scroll={{ x:1100 }} pagination={{ current:page, pageSize, total, onChange:setPage, showSizeChanger:false, showTotal:(count) => `${count} bài viết` }} /></div>
    </div>
  </>
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

