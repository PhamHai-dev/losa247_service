import { useState } from 'react'
import {
  Alert, App, Button, Col, Drawer, Form, Input, InputNumber, Popconfirm, Row,
  Select, Space, Switch, Table, Tag, Typography,
} from 'antd'
import {
  CheckCircleFilled, CheckOutlined, CloseOutlined, CrownOutlined, DeleteOutlined,
  EditOutlined, EyeInvisibleOutlined, FileDoneOutlined, GiftOutlined, PlusOutlined,
  ReloadOutlined, SearchOutlined, TagsOutlined, TranslationOutlined, UnorderedListOutlined,
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
      <div><span className="services-eyebrow"><GiftOutlined /> Trung tâm sản phẩm</span><Title level={3} className="admin-page-title">Quản lý gói dịch vụ</Title><Text>Thiết lập bảng giá, quyền lợi và nội dung so sánh hiển thị trên website.</Text></div>
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
  const [translating, setTranslating] = useState(false)
  const [form] = Form.useForm()
  const { search, onSearch, debounced, page, setPage, pageSize } = useListParams()
  const query = useApiQuery(() => pricingService.getPlans({ search: debounced || undefined, isActive, page, limit: pageSize }), [debounced, isActive, page])
  const statsQuery = useApiQuery(() => pricingService.getStats(), [])
  const rows = query.data?.items || []
  const total = query.data?.pagination?.total || 0
  const stats = statsQuery.data || { totalPlans: 0, activePlans: 0, inactivePlans: 0, totalFeatures: 0 }

  const openDrawer = (row = null) => {
    setEditing(row)
    const vi = row?.translations?.vi || (row ? { name: row.name, price: row.price, badge: row.badge, buttonText: row.buttonText, subtitle: row.subtitle || [], feature: row.feature || [] } : { name: '', price: '', badge: '', buttonText: 'Bắt đầu ngay', subtitle: [], feature: [] })
    const en = row?.translations?.en || { name: '', price: '', badge: '', buttonText: '', subtitle: [], feature: [] }
    form.setFieldsValue({ order: row?.order || 0, isActive: row?.isActive ?? true, translations: { vi, en } })
    setEditing(row)
    setOpen(true)
  }
  const closeDrawer = () => { setOpen(false); setEditing(null); form.resetFields() }
  const refresh = () => { query.refetch(); statsQuery.refetch() }
  const submit = async () => {
    try {
      await form.validateFields()
      const values = form.getFieldsValue(true)
      setSaving(true)
      const en = values.translations?.en
      if (!en?.name?.trim()) delete values.translations.en
      if (editing?._id) await pricingService.updatePlan(editing._id, values); else await pricingService.createPlan(values)
      message.success(editing ? 'Đã cập nhật gói dịch vụ' : 'Đã tạo gói dịch vụ'); closeDrawer(); refresh()
    } catch (error) { if (!error?.errorFields) message.error(errorMessage(error, 'Không lưu được gói dịch vụ')) }
    finally { setSaving(false) }
  }
  const translate = async () => {
    try {
      const source = form.getFieldValue(['translations', 'vi'])
      if (!source?.name?.trim()) return message.warning('Vui lòng nhập nội dung Tiếng Việt trước')
      setTranslating(true)
      const preview = await pricingService.translatePreview('plan', source)
      form.setFieldValue(['translations', 'en'], preview)
      message.success('Đã tạo bản dịch English. Hãy kiểm tra trước khi lưu.')
    } catch (error) { message.error(errorMessage(error, 'Không thể dịch gói bằng Gemini')) }
    finally { setTranslating(false) }
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
    { title: 'Dịch', key: 'translation', width: 125, render: (_, row) => row.hasEnglish ? <Tag color="success">English</Tag> : <Tag color="warning">Thiếu English</Tag> },
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
    <PlanDrawer open={open} editing={editing} form={form} saving={saving} translating={translating} onClose={closeDrawer} onSubmit={submit} onTranslate={translate} />
  </section>
}

function ServiceKpi({ icon, tone, label, value, note }) { return <article className="service-kpi"><span className={`service-kpi-icon ${tone}`}>{icon}</span><div><span>{label}</span><strong>{value}</strong><small>{note}</small></div></article> }
function ServiceEmpty({ icon, title }) { return <div className="services-empty">{icon}<strong>{title}</strong><span>Thử thay đổi bộ lọc hoặc thêm dữ liệu mới.</span></div> }

function PlanDrawer({ open, editing, form, saving, translating, onClose, onSubmit, onTranslate }) {
  const [locale, setLocale] = useState('vi')
  const hasEnglish = Boolean(Form.useWatch(['translations', 'en', 'name'], form)?.trim())
  return <Drawer className="services-drawer" title={null} width={680} open={open} onClose={onClose} destroyOnClose afterOpenChange={(visible) => visible && setLocale('vi')}>
    <div className="services-drawer-header"><span><GiftOutlined /></span><div><Title level={4}>{editing ? 'Chỉnh sửa gói dịch vụ' : 'Tạo gói dịch vụ mới'}</Title><Text>Quản lý nội dung Tiếng Việt và English trong cùng một gói.</Text></div></div>
    <Form form={form} layout="vertical" requiredMark={false} className="services-form">
      <section className="services-form-section"><div className="services-form-title"><span>01</span><div><strong>Cấu hình chung</strong><small>Thứ tự và trạng thái dùng cho cả hai ngôn ngữ</small></div></div>
        <Row gutter={14}><Col span={10}><Form.Item name="order" label="Thứ tự"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col><Col span={14}><Form.Item name="isActive" label="Hiển thị trên website" valuePropName="checked"><Switch /></Form.Item></Col></Row>
      </section>
      <section className="services-form-section"><div className="services-form-title service-content-title"><span>02</span><div><strong>Nội dung gói dịch vụ</strong><small>Tiếng Việt là bản gốc, English có thể tạo bằng Gemini</small></div>{locale === 'en' && <Button id="services-plan-translate" type="primary" icon={<TranslationOutlined />} loading={translating} onClick={onTranslate}>Dịch bằng Gemini</Button>}</div>
        <nav className="faq-language-tabs" aria-label="Ngôn ngữ gói dịch vụ"><button type="button" className={locale === 'vi' ? 'active' : ''} onClick={() => setLocale('vi')}>Tiếng Việt</button><button type="button" className={locale === 'en' ? 'active' : ''} onClick={() => setLocale('en')}>English {hasEnglish && <small>Đã có</small>}</button></nav>
        <Row gutter={14}><Col span={15}><Form.Item name={['translations', locale, 'name']} label={locale === 'vi' ? 'Tên gói' : 'Plan name'} rules={locale === 'vi' ? [{ required: true, whitespace: true, message: 'Vui lòng nhập tên gói' }] : []}><Input placeholder={locale === 'vi' ? 'Ví dụ: Gói Tăng trưởng' : 'Growth plan'} /></Form.Item></Col><Col span={9}><Form.Item name={['translations', locale, 'price']} label={locale === 'vi' ? 'Mức giá' : 'Price'} rules={locale === 'vi' ? [{ required: true, message: 'Vui lòng nhập mức giá' }] : []}><Input placeholder="6.000.000đ / tháng" /></Form.Item></Col></Row>
        <Row gutter={14}><Col span={12}><Form.Item name={['translations', locale, 'badge']} label={locale === 'vi' ? 'Nhãn nổi bật' : 'Badge'}><Input placeholder="PHỔ BIẾN NHẤT" /></Form.Item></Col><Col span={12}><Form.Item name={['translations', locale, 'buttonText']} label={locale === 'vi' ? 'Nội dung nút' : 'Button text'}><Input placeholder={locale === 'vi' ? 'Bắt đầu ngay' : 'Get started'} /></Form.Item></Col></Row>
      </section>
      <DynamicList name={['translations', locale, 'subtitle']} title={locale === 'vi' ? 'Nội dung dưới giá' : 'Price notes'} placeholder={locale === 'vi' ? 'Ví dụ: Thanh toán theo tháng' : 'Monthly billing'} />
      <DynamicList name={['translations', locale, 'feature']} title={locale === 'vi' ? 'Danh sách tính năng' : 'Features'} placeholder={locale === 'vi' ? 'Ví dụ: Tích hợp đa kênh' : 'Omnichannel integration'} />
    </Form>
    <div className="services-drawer-actions"><Button onClick={onClose}>Hủy</Button><Button id="services-plan-save" type="primary" icon={<CheckOutlined />} loading={saving} onClick={onSubmit}>{editing ? 'Lưu thay đổi' : 'Tạo gói dịch vụ'}</Button></div>
  </Drawer>
}

function DynamicList({ name, title, placeholder }) {
  return <section className="services-form-section"><div className="services-form-title"><span>03</span><div><strong>{title}</strong><small>Thêm hoặc xóa từng dòng nội dung</small></div></div><Form.List name={name}>{(fields, { add, remove }) => <div className="services-dynamic-list">{fields.map(({ key, name: fieldName, ...rest }) => <div className="services-dynamic-row" key={key}><span>{fieldName + 1}</span><Form.Item {...rest} name={fieldName} rules={[{ required: true, message: 'Không được để trống' }]}><Input placeholder={placeholder} /></Form.Item><Button type="text" danger icon={<CloseOutlined />} onClick={() => remove(fieldName)} /></div>)}<Button type="dashed" icon={<PlusOutlined />} onClick={() => add()} block>Thêm một dòng</Button></div>}</Form.List></section>
}

function PricingComparisonsTable() {
  const { message } = App.useApp()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [translating, setTranslating] = useState(false)
  const [locale, setLocale] = useState('vi')
  const [form] = Form.useForm()
  const plansQ = useApiQuery(() => pricingService.getPlans({ limit: 100 }), [])
  const query = useApiQuery(() => pricingService.getComparisons(), [])
  const plans = plansQ.data?.items || []
  const rows = query.data?.items || []
  const openDrawer = (row = null) => {
    const vi = row?.translations?.vi || (row ? { title: row.title, values: row.values || {} } : { title: '', values: {} })
    const en = row?.translations?.en || { title: '', values: {} }
    setEditing(row); setLocale('vi'); form.setFieldsValue({ order: row?.order ?? rows.length, translations: { vi, en } }); setOpen(true)
  }
  const closeDrawer = () => { setOpen(false); setEditing(null); form.resetFields() }
  const submit = async () => {
    try {
      await form.validateFields()
      const values = form.getFieldsValue(true)
      setSaving(true)
      if (!values.translations?.en?.title?.trim()) delete values.translations.en
      if (editing?._id) await pricingService.updateComparison(editing._id, values); else await pricingService.createComparison(values)
      message.success('Đã lưu dòng so sánh'); closeDrawer(); query.refetch()
    } catch (error) { if (!error?.errorFields) message.error(errorMessage(error, 'Không lưu được dòng so sánh')) }
    finally { setSaving(false) }
  }
  const translate = async () => {
    try {
      const source = form.getFieldValue(['translations', 'vi'])
      if (!source?.title?.trim()) return message.warning('Vui lòng nhập tiêu chí Tiếng Việt trước')
      setTranslating(true)
      const preview = await pricingService.translatePreview('comparison', source)
      form.setFieldValue(['translations', 'en'], preview)
      message.success('Đã tạo bản dịch English. Hãy kiểm tra trước khi lưu.')
    } catch (error) { message.error(errorMessage(error, 'Không thể dịch tiêu chí bằng Gemini')) }
    finally { setTranslating(false) }
  }
  const remove = async (row) => { try { await pricingService.deleteComparison(row._id); message.success('Đã xóa dòng so sánh'); query.refetch() } catch (error) { message.error(errorMessage(error, 'Không xóa được dòng so sánh')) } }
  window.__openPricingComparison = openDrawer
  const columns = [
    { title: 'Tiêu chí so sánh', dataIndex: 'title', key: 'title', fixed: 'left', width: 190, render: (value) => <span className="comparison-title" title={value}><FileDoneOutlined />{value}</span> },
    ...plans.map((plan) => ({ title: <div className="comparison-plan-head"><strong>{plan.name}</strong><small>{plan.price}</small></div>, dataIndex: ['values', plan._id], key: plan._id, width: 180, align: 'center', render: (value) => typeof value === 'boolean' ? <span className={`comparison-boolean ${value ? 'yes' : 'no'}`}>{value ? <CheckOutlined /> : <CloseOutlined />}</span> : <span className="comparison-value">{value || '—'}</span> })),
    { title: 'Dịch', key: 'translation', width: 120, render: (_, row) => row.hasEnglish ? <Tag color="success">English</Tag> : <Tag color="warning">Thiếu English</Tag> },
    { title: 'Thứ tự', dataIndex: 'order', key: 'order', width: 90, align: 'center' },
    { title: 'Thao tác', key: 'actions', width: 110, render: (_, row) => <div className="service-row-actions"><Button type="text" icon={<EditOutlined />} onClick={() => openDrawer(row)} /><Popconfirm title="Xóa dòng so sánh?" onConfirm={() => remove(row)}><Button type="text" danger icon={<DeleteOutlined />} /></Popconfirm></div> },
  ]
  return <section className="services-panel comparison-panel">
    <div className="comparison-hero"><span><UnorderedListOutlined /></span><div><strong>Ma trận so sánh quyền lợi</strong><p>Quản lý từng tiêu chí và giá trị tương ứng giữa các gói dịch vụ.</p></div><div className="comparison-summary"><span><b>{plans.length}</b> gói dịch vụ</span><span><b>{rows.length}</b> dòng so sánh</span></div></div>
    <div className="services-table-card"><div className="services-toolbar"><div className="services-toolbar-copy"><strong>Bảng so sánh chi tiết</strong><span>Dữ liệu hiển thị theo thứ tự từ trên xuống</span></div><Space><Button icon={<ReloadOutlined />} onClick={() => { query.refetch(); plansQ.refetch() }}>Tải lại</Button><Button id="services-add-comparison" type="primary" icon={<PlusOutlined />} onClick={() => openDrawer()}>Thêm tiêu chí</Button></Space></div>
      {(query.error || plansQ.error) && <Alert type="error" showIcon message={query.error || plansQ.error} />}
      <Table className="services-table comparison-table" rowKey="_id" loading={query.loading || plansQ.loading} columns={columns} dataSource={rows} pagination={false} scroll={{ x: Math.max(900, 500 + plans.length * 180) }} />
    </div>
    <Drawer className="services-drawer" title={null} width={660} open={open} onClose={closeDrawer} destroyOnClose>
      <div className="services-drawer-header"><span><UnorderedListOutlined /></span><div><Title level={4}>{editing ? 'Chỉnh sửa tiêu chí' : 'Thêm tiêu chí so sánh'}</Title><Text>Quản lý Tiếng Việt và English trong cùng một tiêu chí.</Text></div></div>
      <Form form={form} layout="vertical" requiredMark={false} className="services-form">
        <section className="services-form-section"><div className="services-form-title"><span>01</span><div><strong>Cấu hình chung</strong><small>Vị trí hiển thị của tiêu chí</small></div></div><Form.Item name="order" label="Thứ tự"><InputNumber min={0} style={{ width: 180 }} /></Form.Item></section>
        <section className="services-form-section"><div className="services-form-title service-content-title"><span>02</span><div><strong>Nội dung tiêu chí</strong><small>Tiếng Việt là bản gốc, English có thể tạo bằng Gemini</small></div>{locale === 'en' && <Button id="services-comparison-translate" type="primary" icon={<TranslationOutlined />} loading={translating} onClick={translate}>Dịch bằng Gemini</Button>}</div>
          <nav className="faq-language-tabs" aria-label="Ngôn ngữ tiêu chí"><button type="button" className={locale === 'vi' ? 'active' : ''} onClick={() => setLocale('vi')}>Tiếng Việt</button><button type="button" className={locale === 'en' ? 'active' : ''} onClick={() => setLocale('en')}>English</button></nav>
          <Form.Item name={['translations', locale, 'title']} label={locale === 'vi' ? 'Tên tiêu chí' : 'Feature name'} rules={locale === 'vi' ? [{ required: true, whitespace: true, message: 'Vui lòng nhập tên tiêu chí' }] : []}><Input placeholder={locale === 'vi' ? 'Ví dụ: Số lượng tài khoản' : 'Number of accounts'} /></Form.Item>
          <div className="comparison-fields">{plans.map((plan) => <div className="comparison-field" key={plan._id}><div><strong>{plan.name}</strong><small>{plan.price}</small></div><Form.Item name={['translations', locale, 'values', plan._id]}><Input placeholder="Có / Không hoặc nội dung tùy chỉnh" /></Form.Item></div>)}</div>
        </section>
      </Form>
      <div className="services-drawer-actions"><Button onClick={closeDrawer}>Hủy</Button><Button id="services-comparison-save" type="primary" icon={<CheckOutlined />} loading={saving} onClick={submit}>Lưu tiêu chí</Button></div>
    </Drawer>
  </section>
}

if (typeof window !== 'undefined') {
  window.addEventListener('openAddPricingPlan', () => window.__openPricingPlan?.())
  window.addEventListener('openAddPricingComparison', () => window.__openPricingComparison?.())
}

