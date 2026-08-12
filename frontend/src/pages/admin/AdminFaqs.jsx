import { useState } from 'react'
import {
  Alert, App, Button, Col, Drawer, Form, Input, InputNumber, Popconfirm, Row,
  Select, Space, Table, Tag, Typography,
} from 'antd'
import {
  ArrowDownOutlined, ArrowUpOutlined, BookOutlined, CheckOutlined, DeleteOutlined,
  EditOutlined, FileTextOutlined, HomeOutlined, MessageOutlined, PlusOutlined,
  QuestionCircleOutlined, ReloadOutlined, SearchOutlined, TagsOutlined,
} from '@ant-design/icons'
import { useApiQuery } from '../../hooks/useApiQuery'
import { useListParams } from '../../hooks/useListParams'
import { faqsService } from '../../features/faqs/faqsService'
import { formatDate } from '../../utils/format'
import '../../styles/admin/faqs.css'

const { Title, Text } = Typography
const PAGE_OPTIONS = [
  { value: 'home', label: 'Trang chủ', icon: <HomeOutlined /> },
  { value: 'solutions', label: 'Giải pháp', icon: <TagsOutlined /> },
  { value: 'pricing', label: 'Bảng giá', icon: <FileTextOutlined /> },
  { value: 'blog', label: 'Blog', icon: <BookOutlined /> },
]
const SERVICE_OPTIONS = [
  { value: 'chatbot', label: 'Chatbot' },
  { value: 'crm', label: 'CRM' },
  { value: 'marketing', label: 'Marketing' },
]
const pageLabel = (value) => PAGE_OPTIONS.find((item) => item.value === value)?.label || value
const serviceLabel = (value) => SERVICE_OPTIONS.find((item) => item.value === value)?.label || 'Chung'
const errorMessage = (error, fallback) => error?.response?.data?.error?.message || error?.error?.message || fallback

export function AdminFaqs() {
  const { message } = App.useApp()
  const [editing, setEditing] = useState(null)
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('home')
  const [selectedService, setSelectedService] = useState()
  const [saving, setSaving] = useState(false)
  const [movingId, setMovingId] = useState(null)
  const [form] = Form.useForm()
  const { search, onSearch, debounced, page, setPage, pageSize } = useListParams()
  const query = useApiQuery(
    () => faqsService.getFaqs({ search: debounced || undefined, page, limit: pageSize, pageType: activeTab, serviceDetail: selectedService }),
    [debounced, page, activeTab, selectedService],
  )
  const statsQuery = useApiQuery(() => faqsService.getStats(), [])
  const rows = query.data?.items || []
  const total = query.data?.pagination?.total || 0
  const stats = statsQuery.data || { total: 0, home: 0, solutions: 0, pricing: 0, blog: 0 }
  const needsService = activeTab === 'solutions' || activeTab === 'pricing'

  const changeTab = (key) => {
    setActiveTab(key)
    setSelectedService(undefined)
    setPage(1)
  }
  const openDrawer = (row = null) => {
    const values = row || { page: activeTab, serviceDetail: needsService ? selectedService : undefined, question: '', answer: '', order: 0 }
    setEditing(row)
    form.setFieldsValue(values)
    setOpen(true)
  }
  const closeDrawer = () => { setOpen(false); setEditing(null); form.resetFields() }
  const refresh = () => { query.refetch(); statsQuery.refetch() }
  const submit = async () => {
    try {
      const values = await form.validateFields()
      setSaving(true)
      if (!['solutions', 'pricing'].includes(values.page)) delete values.serviceDetail
      if (editing?._id) await faqsService.updateFaq(editing._id, values)
      else await faqsService.createFaq(values)
      message.success(editing ? 'Đã cập nhật câu hỏi' : 'Đã tạo câu hỏi mới')
      closeDrawer(); refresh()
    } catch (error) {
      if (!error?.errorFields) message.error(errorMessage(error, 'Không lưu được câu hỏi'))
    } finally { setSaving(false) }
  }
  const remove = async (row) => {
    try { await faqsService.deleteFaq(row._id); message.success('Đã xóa câu hỏi'); refresh() }
    catch (error) { message.error(errorMessage(error, 'Không xóa được câu hỏi')) }
  }
  const move = async (index, direction) => {
    const target = index + direction
    if (target < 0 || target >= rows.length) return
    const reordered = [...rows]
    ;[reordered[index], reordered[target]] = [reordered[target], reordered[index]]
    try {
      setMovingId(rows[index]._id)
      await faqsService.reorder(reordered.map((item) => item._id), { pageType: activeTab, serviceDetail: selectedService })
      message.success('Đã cập nhật thứ tự'); query.refetch()
    } catch (error) { message.error(errorMessage(error, 'Không cập nhật được thứ tự')) }
    finally { setMovingId(null) }
  }

  const columns = [
    { title: 'Thứ tự', key: 'order', width: 118, render: (_, row, index) => <div className="faq-order-control"><span>{row.order ?? index}</span><div><Button type="text" size="small" icon={<ArrowUpOutlined />} disabled={index === 0} loading={movingId === row._id} aria-label={`Đưa ${row.question} lên`} onClick={() => move(index, -1)} /><Button type="text" size="small" icon={<ArrowDownOutlined />} disabled={index === rows.length - 1} aria-label={`Đưa ${row.question} xuống`} onClick={() => move(index, 1)} /></div></div> },
    { title: 'Nội dung hỏi đáp', key: 'content', minWidth: 390, render: (_, row) => <div className="faq-content-cell"><span><QuestionCircleOutlined /></span><div><strong>{row.question}</strong><p>{row.answer}</p></div></div> },
    { title: 'Khu vực', dataIndex: 'page', key: 'page', width: 145, render: (value) => <Tag className={`faq-page-tag ${value}`}>{pageLabel(value)}</Tag> },
    { title: 'Dịch vụ', dataIndex: 'serviceDetail', key: 'service', width: 125, render: (value) => value ? <span className="faq-service-tag">{serviceLabel(value)}</span> : <span className="faq-muted">Nội dung chung</span> },
    { title: 'Cập nhật', dataIndex: 'updatedAt', key: 'updatedAt', width: 145, render: (value) => <span className="faq-date">{value ? formatDate(value) : '—'}</span> },
    { title: 'Thao tác', key: 'action', fixed: 'right', width: 110, render: (_, row) => <div className="faq-row-actions"><Button type="text" icon={<EditOutlined />} aria-label={`Sửa ${row.question}`} onClick={() => openDrawer(row)} /><Popconfirm title="Xóa câu hỏi?" description="Câu hỏi sẽ bị xóa khỏi website." onConfirm={() => remove(row)}><Button type="text" danger icon={<DeleteOutlined />} aria-label={`Xóa ${row.question}`} /></Popconfirm></div> },
  ]

  return <main className="faqs-page">
    <header className="faqs-page-header">
      <div><span className="faqs-eyebrow"><MessageOutlined /> Trung tâm nội dung</span><Title level={3}>Quản lý Hỏi đáp</Title><Text>Xây dựng kho câu trả lời rõ ràng, đúng ngữ cảnh cho khách hàng trên website.</Text></div>
      <Button id="faqs-header-add" type="primary" size="large" icon={<PlusOutlined />} onClick={() => openDrawer()}>Tạo câu hỏi</Button>
    </header>

    <div className="faqs-kpi-grid">
      <FaqKpi tone="teal" icon={<QuestionCircleOutlined />} label="Tổng câu hỏi" value={stats.total} note="Trên toàn website" />
      <FaqKpi tone="green" icon={<HomeOutlined />} label="Trang chủ" value={stats.home} note="Nội dung tổng quan" />
      <FaqKpi tone="orange" icon={<TagsOutlined />} label="Giải pháp" value={stats.solutions} note="Theo từng dịch vụ" />
      <FaqKpi tone="violet" icon={<FileTextOutlined />} label="Bảng giá & Blog" value={(stats.pricing || 0) + (stats.blog || 0)} note={`${stats.pricing || 0} bảng giá · ${stats.blog || 0} blog`} />
    </div>

    <nav className="faqs-tabs" aria-label="Khu vực hiển thị câu hỏi">
      {PAGE_OPTIONS.map((item) => <button id={`faqs-tab-${item.value}`} type="button" key={item.value} className={activeTab === item.value ? 'active' : ''} onClick={() => changeTab(item.value)}>{item.icon}<span>{item.label}</span><b>{stats[item.value] || 0}</b></button>)}
    </nav>

    <section className="faqs-table-card">
      <div className="faqs-toolbar"><div className="faqs-toolbar-copy"><strong>Câu hỏi tại {pageLabel(activeTab)}</strong><span>{total} nội dung được tìm thấy</span></div><div className="faqs-toolbar-actions">
        <Input id="faqs-search" allowClear prefix={<SearchOutlined />} placeholder="Tìm trong câu hỏi, câu trả lời..." value={search} onChange={(event) => { onSearch(event.target.value); setPage(1) }} />
        {needsService && <Select id="faqs-service-filter" allowClear placeholder="Tất cả dịch vụ" value={selectedService} onChange={(value) => { setSelectedService(value); setPage(1) }} options={SERVICE_OPTIONS} />}
        <Button id="faqs-refresh" icon={<ReloadOutlined />} loading={query.loading} onClick={refresh}>Tải lại</Button>
        <Button id="faqs-add" type="primary" icon={<PlusOutlined />} onClick={() => openDrawer()}>Thêm câu hỏi</Button>
      </div></div>
      {query.error && <Alert type="error" showIcon message={query.error} className="faqs-error" />}
      <Table className="faqs-table" rowKey="_id" loading={query.loading} columns={columns} dataSource={rows} scroll={{ x: 1100 }} locale={{ emptyText: <FaqEmpty /> }} pagination={{ current: page, pageSize, total, onChange: setPage, showSizeChanger: false, showTotal: (count) => `Tổng ${count} câu hỏi` }} />
    </section>

    <FaqDrawer open={open} editing={editing} form={form} saving={saving} activeTab={activeTab} selectedService={selectedService} onClose={closeDrawer} onSubmit={submit} />
  </main>
}

function FaqKpi({ icon, tone, label, value, note }) {
  return <article className="faq-kpi"><span className={`faq-kpi-icon ${tone}`}>{icon}</span><div><span>{label}</span><strong>{value}</strong><small>{note}</small></div></article>
}

function FaqEmpty() {
  return <div className="faqs-empty"><QuestionCircleOutlined /><strong>Chưa có câu hỏi trong khu vực này</strong><span>Thử thay đổi bộ lọc hoặc tạo nội dung mới.</span></div>
}

function FaqDrawer({ open, editing, form, saving, activeTab, selectedService, onClose, onSubmit }) {
  return <Drawer className="faqs-drawer" title={null} width={640} open={open} onClose={onClose} destroyOnClose>
    <div className="faqs-drawer-header"><span><QuestionCircleOutlined /></span><div><Title level={4}>{editing ? 'Chỉnh sửa câu hỏi' : 'Tạo câu hỏi mới'}</Title><Text>Nội dung được công khai tại khu vực bạn lựa chọn.</Text></div></div>
    <Form form={form} layout="vertical" requiredMark={false} className="faqs-form" initialValues={{ page: activeTab, serviceDetail: selectedService, order: 0 }}>
      <section className="faqs-form-section"><div className="faqs-form-title"><span>01</span><div><strong>Vị trí hiển thị</strong><small>Chọn đúng ngữ cảnh để khách hàng dễ tìm thấy</small></div></div>
        <Row gutter={14}><Col span={16}><Form.Item name="page" label="Khu vực trên website" rules={[{ required: true, message: 'Vui lòng chọn khu vực' }]}><Select id="faq-form-page" options={PAGE_OPTIONS.map(({ value, label }) => ({ value, label }))} onChange={(value) => { if (!['solutions', 'pricing'].includes(value)) form.setFieldValue('serviceDetail', undefined) }} /></Form.Item></Col><Col span={8}><Form.Item name="order" label="Thứ tự"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col></Row>
        <Form.Item noStyle shouldUpdate={(previous, current) => previous.page !== current.page}>{({ getFieldValue }) => ['solutions', 'pricing'].includes(getFieldValue('page')) ? <Form.Item name="serviceDetail" label="Dịch vụ chi tiết"><Select id="faq-form-service" allowClear placeholder="Nội dung chung hoặc chọn dịch vụ" options={SERVICE_OPTIONS} /></Form.Item> : null}</Form.Item>
      </section>
      <section className="faqs-form-section"><div className="faqs-form-title"><span>02</span><div><strong>Nội dung hỏi đáp</strong><small>Viết ngắn gọn, trực tiếp và dễ hiểu</small></div></div>
        <Form.Item name="question" label="Câu hỏi" rules={[{ required: true, whitespace: true, message: 'Vui lòng nhập câu hỏi' }, { max: 300, message: 'Tối đa 300 ký tự' }]}><Input id="faq-form-question" showCount maxLength={300} placeholder="Ví dụ: Tôi có thể dùng thử dịch vụ trước khi đăng ký không?" /></Form.Item>
        <Form.Item name="answer" label="Câu trả lời" rules={[{ required: true, whitespace: true, message: 'Vui lòng nhập câu trả lời' }, { max: 5000, message: 'Tối đa 5000 ký tự' }]}><Input.TextArea id="faq-form-answer" rows={8} showCount maxLength={5000} placeholder="Trình bày câu trả lời đầy đủ nhưng dễ quét nội dung..." /></Form.Item>
      </section>
    </Form>
    <div className="faqs-drawer-actions"><Button onClick={onClose}>Hủy</Button><Button id="faq-save" type="primary" icon={<CheckOutlined />} loading={saving} onClick={onSubmit}>{editing ? 'Lưu thay đổi' : 'Tạo câu hỏi'}</Button></div>
  </Drawer>
}
