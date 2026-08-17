import { useState } from 'react'
import {
  Alert, App, Button, Col, Drawer, Form, Input, InputNumber, Popconfirm, Row,
  Select, Space, Switch, Table, Tag, Typography,
} from 'antd'
import {
  CheckCircleFilled, CheckOutlined, CloseOutlined, CrownOutlined, DeleteOutlined,
  EditOutlined, EyeInvisibleOutlined, FileDoneOutlined, GiftOutlined, PlusOutlined,
  ReloadOutlined, SearchOutlined, TagsOutlined, UnorderedListOutlined,
} from '@ant-design/icons'
import { useApiQuery } from '../../hooks/useApiQuery'
import { useListParams } from '../../hooks/useListParams'
import { pricingService } from '../../features/services/pricingService'
import '../../styles/admin/services.css'

const { Title, Text } = Typography
const errorMessage = (error, fallback) => error?.response?.data?.message || error?.error?.message || fallback

export function AdminServices() {
  const [activeTab, setActiveTab] = useState('plans')
  const addEvent = activeTab === 'plans' ? 'openAddPricingPlan' : 'openAddPricingComparison'

  return <main className="services-page">
    <header className="services-page-header">
      <div><span className="services-eyebrow"><GiftOutlined /> Trung tâm sản phẩm</span><Title level={3}>Quản lý gói dịch vụ</Title><Text>Thiết lập bảng giá, quyền lợi và nội dung so sánh hiển thị trên website.</Text></div>
      <Button id="services-header-add" type="primary" size="large" icon={<PlusOutlined />} onClick={() => window.dispatchEvent(new Event(addEvent))}>
        {activeTab === 'plans' ? 'Thêm gói dịch vụ' : 'Thêm dòng so sánh'}
      </Button>
    </header>
    <nav className="services-tabs" aria-label="Khu vực quản lý gói dịch vụ">
      <button id="services-tab-plans" type="button" className={activeTab === 'plans' ? 'active' : ''} onClick={() => setActiveTab('plans')}><GiftOutlined /><span>Gói dịch vụ</span></button>
      <button id="services-tab-comparisons" type="button" className={activeTab === 'comparisons' ? 'active' : ''} onClick={() => setActiveTab('comparisons')}><UnorderedListOutlined /><span>Bảng so sánh</span></button>
    </nav>
    {activeTab === 'plans' ? <PricingPlansTable /> : <PricingComparisonsTable />}
  </main>
}

function PricingPlansTable() {
  const { message } = App.useApp()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [isActive, setIsActive] = useState()
  const [saving, setSaving] = useState(false)
  const [form] = Form.useForm()
  const { search, onSearch, debounced, page, setPage, pageSize } = useListParams()
  const query = useApiQuery(() => pricingService.getPlans({ search: debounced || undefined, isActive, page, limit: pageSize }), [debounced, isActive, page])
  const statsQuery = useApiQuery(() => pricingService.getStats(), [])
  const rows = query.data?.items || []
  const total = query.data?.pagination?.total || 0
  const stats = statsQuery.data || { totalPlans: 0, activePlans: 0, inactivePlans: 0, totalFeatures: 0 }

  const openDrawer = (row = null) => {
    setEditing(row)
    form.setFieldsValue(row || { name: '', price: '', badge: '', buttonText: 'Bắt đầu ngay', order: 0, isActive: true, subtitle: [], feature: [] })
    setOpen(true)
  }
  const closeDrawer = () => { setOpen(false); setEditing(null); form.resetFields() }
  const refresh = () => { query.refetch(); statsQuery.refetch() }
  const submit = async () => {
    try {
      const values = await form.validateFields(); setSaving(true)
      if (editing?._id) await pricingService.updatePlan(editing._id, values); else await pricingService.createPlan(values)
      message.success(editing ? 'Đã cập nhật gói dịch vụ' : 'Đã tạo gói dịch vụ'); closeDrawer(); refresh()
    } catch (error) { if (!error?.errorFields) message.error(errorMessage(error, 'Không lưu được gói dịch vụ')) }
    finally { setSaving(false) }
  }
  const toggleActive = async (row, checked) => {
    try { await pricingService.updatePlan(row._id, { isActive: checked }); message.success(checked ? 'Đã hiển thị gói' : 'Đã ẩn gói'); refresh() }
    catch (error) { message.error(errorMessage(error, 'Không cập nhật được trạng thái')) }
  }
  const remove = async (row) => {
    try { await pricingService.deletePlan(row._id); message.success('Đã xóa gói dịch vụ'); refresh() }
    catch (error) { message.error(errorMessage(error, 'Không xóa được gói dịch vụ')) }
  }

  window.__openPricingPlan = openDrawer
  const columns = [
    { title: 'Gói dịch vụ', key: 'plan', minWidth: 260, render: (_, row) => <div className="service-identity"><span className={row.badge ? 'featured' : ''}>{row.badge ? <CrownOutlined /> : <GiftOutlined />}</span><div><strong>{row.name}</strong><small>{row.buttonText || 'Chưa thiết lập nút hành động'}</small></div></div> },
    { title: 'Mức giá', dataIndex: 'price', key: 'price', width: 190, render: (value) => <span className="service-price">{value}</span> },
    { title: 'Nhãn', dataIndex: 'badge', key: 'badge', width: 150, render: (value) => value ? <Tag className="service-badge"><CrownOutlined />{value}</Tag> : <span className="service-muted">Không có</span> },
    { title: 'Nội dung', key: 'content', width: 155, render: (_, row) => <div className="service-counts"><span><FileDoneOutlined />{row.feature?.length || 0} tính năng</span><span><TagsOutlined />{row.subtitle?.length || 0} dòng phụ</span></div> },
    { title: 'Thứ tự', dataIndex: 'order', key: 'order', width: 90, align: 'center', render: (value) => <span className="service-order">{value}</span> },
    { title: 'Trạng thái', dataIndex: 'isActive', key: 'isActive', width: 180, render: (value, row) => <div className="service-status-control"><span className={`service-status ${value ? 'active' : 'hidden'}`}><i />{value ? 'Đang hiển thị' : 'Đang ẩn'}</span><Switch size="small" checked={value} onChange={(checked) => toggleActive(row, checked)} /></div> },
    { title: 'Thao tác', key: 'action', fixed: 'right', width: 110, render: (_, row) => <div className="service-row-actions"><Button type="text" icon={<EditOutlined />} aria-label={`Sửa ${row.name}`} onClick={() => openDrawer(row)} /><Popconfirm title="Xóa gói dịch vụ?" description="Dữ liệu của gói trong bảng so sánh cũng sẽ được dọn." onConfirm={() => remove(row)}><Button type="text" danger icon={<DeleteOutlined />} aria-label={`Xóa ${row.name}`} /></Popconfirm></div> },
  ]

  return <section className="services-panel">
    <div className="services-kpi-grid">
      <ServiceKpi tone="teal" icon={<GiftOutlined />} label="Tổng gói dịch vụ" value={stats.totalPlans} note="Trong hệ thống" />
      <ServiceKpi tone="green" icon={<CheckCircleFilled />} label="Đang hiển thị" value={stats.activePlans} note="Khách hàng có thể xem" />
      <ServiceKpi tone="orange" icon={<EyeInvisibleOutlined />} label="Đang tạm ẩn" value={stats.inactivePlans} note="Chưa công khai" />
      <ServiceKpi tone="violet" icon={<FileDoneOutlined />} label="Tổng tính năng" value={stats.totalFeatures} note="Trên tất cả gói" />
    </div>
    <div className="services-table-card">
      <div className="services-toolbar"><div className="services-toolbar-copy"><strong>Danh sách gói dịch vụ</strong><span>{total} gói được tìm thấy</span></div><div className="services-toolbar-actions">
        <Input id="services-search" allowClear prefix={<SearchOutlined />} placeholder="Tìm theo tên gói..." value={search} onChange={(event) => { onSearch(event.target.value); setPage(1) }} />
        <Select id="services-status-filter" allowClear placeholder="Tất cả trạng thái" value={isActive} onChange={(value) => { setIsActive(value); setPage(1) }} options={[{ value: 'true', label: 'Đang hiển thị' }, { value: 'false', label: 'Đang ẩn' }]} />
        <Button id="services-refresh" icon={<ReloadOutlined />} loading={query.loading} onClick={refresh}>Tải lại</Button>
        <Button id="services-add-plan" type="primary" icon={<PlusOutlined />} onClick={() => openDrawer()}>Thêm gói</Button>
      </div></div>
      {query.error && <Alert type="error" showIcon message={query.error} className="services-error" />}
      <Table className="services-table" rowKey="_id" loading={query.loading} columns={columns} dataSource={rows} scroll={{ x: 1200 }} locale={{ emptyText: <ServiceEmpty icon={<GiftOutlined />} title="Chưa tìm thấy gói dịch vụ" /> }} pagination={{ current: page, pageSize, total, onChange: setPage, showSizeChanger: false, showTotal: (count) => `Tổng ${count} gói` }} />
    </div>
    <PlanDrawer open={open} editing={editing} form={form} saving={saving} onClose={closeDrawer} onSubmit={submit} />
  </section>
}

function ServiceKpi({ icon, tone, label, value, note }) { return <article className="service-kpi"><span className={`service-kpi-icon ${tone}`}>{icon}</span><div><span>{label}</span><strong>{value}</strong><small>{note}</small></div></article> }
function ServiceEmpty({ icon, title }) { return <div className="services-empty">{icon}<strong>{title}</strong><span>Thử thay đổi bộ lọc hoặc thêm dữ liệu mới.</span></div> }

function PlanDrawer({ open, editing, form, saving, onClose, onSubmit }) {
  return <Drawer className="services-drawer" title={null} width={620} open={open} onClose={onClose} destroyOnClose extra={null}>
    <div className="services-drawer-header"><span><GiftOutlined /></span><div><Title level={4}>{editing ? 'Chỉnh sửa gói dịch vụ' : 'Tạo gói dịch vụ mới'}</Title><Text>Thông tin này sẽ được sử dụng trực tiếp tại bảng giá công khai.</Text></div></div>
    <Form form={form} layout="vertical" requiredMark={false} className="services-form">
      <section className="services-form-section"><div className="services-form-title"><span>01</span><div><strong>Thông tin chính</strong><small>Tên, giá và cách gói được hiển thị</small></div></div>
        <Row gutter={14}><Col span={15}><Form.Item name="name" label="Tên gói" rules={[{ required: true, message: 'Vui lòng nhập tên gói' }, { max: 120 }]}><Input placeholder="Ví dụ: Gói Tăng trưởng" /></Form.Item></Col><Col span={9}><Form.Item name="order" label="Thứ tự"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col></Row>
        <Form.Item name="price" label="Mức giá hiển thị" rules={[{ required: true, message: 'Vui lòng nhập mức giá' }]}><Input placeholder="Ví dụ: 6.000.000đ / tháng hoặc Liên hệ" /></Form.Item>
        <Row gutter={14}><Col span={12}><Form.Item name="badge" label="Nhãn nổi bật"><Input placeholder="PHỔ BIẾN NHẤT" /></Form.Item></Col><Col span={12}><Form.Item name="buttonText" label="Nội dung nút"><Input placeholder="Bắt đầu ngay" /></Form.Item></Col></Row>
        <Form.Item name="isActive" label="Hiển thị trên website" valuePropName="checked"><Switch checkedChildren="Hiển thị" unCheckedChildren="Đang ẩn" /></Form.Item>
      </section>
      <DynamicList formName="subtitle" title="Nội dung dưới giá" description="Các dòng giải thích ngắn ngay dưới mức giá" placeholder="Ví dụ: Thanh toán theo tháng" />
      <DynamicList formName="feature" title="Danh sách tính năng" description="Những quyền lợi khách hàng nhận được" placeholder="Ví dụ: Tích hợp đa kênh" />
    </Form>
    <div className="services-drawer-actions"><Button onClick={onClose}>Hủy</Button><Button id="services-plan-save" type="primary" icon={<CheckOutlined />} loading={saving} onClick={onSubmit}>{editing ? 'Lưu thay đổi' : 'Tạo gói dịch vụ'}</Button></div>
  </Drawer>
}

function DynamicList({ formName, title, description, placeholder }) {
  return <section className="services-form-section"><div className="services-form-title"><span>{formName === 'subtitle' ? '02' : '03'}</span><div><strong>{title}</strong><small>{description}</small></div></div><Form.List name={formName}>{(fields, { add, remove }) => <div className="services-dynamic-list">{fields.map(({ key, name, ...rest }) => <div className="services-dynamic-row" key={key}><span>{name + 1}</span><Form.Item {...rest} name={name} rules={[{ required: true, message: 'Không được để trống' }]}><Input placeholder={placeholder} /></Form.Item><Button type="text" danger icon={<CloseOutlined />} aria-label="Xóa dòng" onClick={() => remove(name)} /></div>)}<Button type="dashed" icon={<PlusOutlined />} onClick={() => add()} block>Thêm một dòng</Button></div>}</Form.List></section>
}

function PricingComparisonsTable() {
  const { message } = App.useApp()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [form] = Form.useForm()
  const plansQ = useApiQuery(() => pricingService.getPlans({ limit: 100 }), [])
  const query = useApiQuery(() => pricingService.getComparisons(), [])
  const plans = plansQ.data?.items || []
  const rows = query.data?.items || []
  const openDrawer = (row = null) => { setEditing(row); form.setFieldsValue(row || { title: '', order: rows.length, values: {} }); setOpen(true) }
  const closeDrawer = () => { setOpen(false); setEditing(null); form.resetFields() }
  const submit = async () => {
    try {
      const values = await form.validateFields(); setSaving(true)
      const normalized = { ...values, values: Object.fromEntries(Object.entries(values.values || {}).map(([key, value]) => [key, value === 'true' ? true : value === 'false' ? false : value])) }
      if (editing?._id) await pricingService.updateComparison(editing._id, normalized); else await pricingService.createComparison(normalized)
      message.success('Đã lưu dòng so sánh'); closeDrawer(); query.refetch()
    } catch (error) { if (!error?.errorFields) message.error(errorMessage(error, 'Không lưu được dòng so sánh')) }
    finally { setSaving(false) }
  }
  const remove = async (row) => { try { await pricingService.deleteComparison(row._id); message.success('Đã xóa dòng so sánh'); query.refetch() } catch (error) { message.error(errorMessage(error, 'Không xóa được dòng so sánh')) } }
  window.__openPricingComparison = openDrawer
  const columns = [
    { title: 'Tiêu chí so sánh', dataIndex: 'title', key: 'title', fixed: 'left', width: 240, render: (value) => <span className="comparison-title"><FileDoneOutlined />{value}</span> },
    ...plans.map((plan) => ({ title: <div className="comparison-plan-head"><strong>{plan.name}</strong><small>{plan.price}</small></div>, dataIndex: ['values', plan._id], key: plan._id, width: 180, align: 'center', render: (value) => typeof value === 'boolean' ? <span className={`comparison-boolean ${value ? 'yes' : 'no'}`}>{value ? <CheckOutlined /> : <CloseOutlined />}</span> : <span className="comparison-value">{value || '—'}</span> })),
    { title: 'Thứ tự', dataIndex: 'order', key: 'order', width: 90, align: 'center', render: (value) => <span className="service-order">{value}</span> },
    { title: 'Thao tác', key: 'actions', fixed: 'right', width: 110, render: (_, row) => <div className="service-row-actions"><Button type="text" icon={<EditOutlined />} aria-label={`Sửa ${row.title}`} onClick={() => openDrawer(row)} /><Popconfirm title="Xóa dòng so sánh?" onConfirm={() => remove(row)}><Button type="text" danger icon={<DeleteOutlined />} aria-label={`Xóa ${row.title}`} /></Popconfirm></div> },
  ]
  return <section className="services-panel comparison-panel">
    <div className="comparison-hero"><span><UnorderedListOutlined /></span><div><strong>Ma trận so sánh quyền lợi</strong><p>Quản lý từng tiêu chí và giá trị tương ứng giữa các gói dịch vụ.</p></div><div className="comparison-summary"><span><b>{plans.length}</b> gói dịch vụ</span><span><b>{rows.length}</b> dòng so sánh</span></div></div>
    <div className="services-table-card"><div className="services-toolbar"><div className="services-toolbar-copy"><strong>Bảng so sánh chi tiết</strong><span>Dữ liệu hiển thị theo thứ tự từ trên xuống</span></div><Space><Button icon={<ReloadOutlined />} loading={query.loading} onClick={() => { query.refetch(); plansQ.refetch() }}>Tải lại</Button><Button id="services-add-comparison" type="primary" icon={<PlusOutlined />} onClick={() => openDrawer()}>Thêm tiêu chí</Button></Space></div>
      {(query.error || plansQ.error) && <Alert type="error" showIcon message={query.error || plansQ.error} className="services-error" />}
      <Table className="services-table comparison-table" rowKey="_id" loading={query.loading || plansQ.loading} columns={columns} dataSource={rows} pagination={false} scroll={{ x: Math.max(900, 440 + plans.length * 180) }} locale={{ emptyText: <ServiceEmpty icon={<UnorderedListOutlined />} title="Chưa có dòng so sánh" /> }} />
    </div>
    <Drawer className="services-drawer" title={null} width={600} open={open} onClose={closeDrawer} destroyOnClose><div className="services-drawer-header"><span><UnorderedListOutlined /></span><div><Title level={4}>{editing ? 'Chỉnh sửa tiêu chí' : 'Thêm tiêu chí so sánh'}</Title><Text>Nhập Có, Không hoặc nội dung tùy chỉnh cho từng gói.</Text></div></div><Form form={form} layout="vertical" requiredMark={false} className="services-form"><section className="services-form-section"><div className="services-form-title"><span>01</span><div><strong>Thông tin tiêu chí</strong><small>Tên và vị trí hiển thị trong bảng</small></div></div><Row gutter={14}><Col span={17}><Form.Item name="title" label="Tên tiêu chí" rules={[{ required: true, message: 'Vui lòng nhập tên tiêu chí' }]}><Input placeholder="Ví dụ: Số lượng tài khoản" /></Form.Item></Col><Col span={7}><Form.Item name="order" label="Thứ tự"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col></Row></section><section className="services-form-section"><div className="services-form-title"><span>02</span><div><strong>Giá trị theo từng gói</strong><small>Chọn nhanh hoặc nhập nội dung cụ thể</small></div></div><div className="comparison-fields">{plans.map((plan) => <div className="comparison-field" key={plan._id}><div><strong>{plan.name}</strong><small>{plan.price}</small></div><Form.Item name={['values', plan._id]}><Select allowClear placeholder="Chọn hoặc nhập giá trị" showSearch options={[{ value: true, label: '✓ Có' }, { value: false, label: '— Không' }]} dropdownRender={(menu) => menu} /></Form.Item><Form.Item noStyle shouldUpdate={(before, after) => before.values?.[plan._id] !== after.values?.[plan._id]}>{() => { const value = form.getFieldValue(['values', plan._id]); return value === true || value === false ? null : <Form.Item name={['values', plan._id]}><Input placeholder="Nhập nội dung tùy chỉnh" /></Form.Item> }}</Form.Item></div>)}</div></section></Form><div className="services-drawer-actions"><Button onClick={closeDrawer}>Hủy</Button><Button id="services-comparison-save" type="primary" icon={<CheckOutlined />} loading={saving} onClick={submit}>Lưu tiêu chí</Button></div></Drawer>
  </section>
}

if (typeof window !== 'undefined') {
  window.addEventListener('openAddPricingPlan', () => window.__openPricingPlan?.())
  window.addEventListener('openAddPricingComparison', () => window.__openPricingComparison?.())
}

