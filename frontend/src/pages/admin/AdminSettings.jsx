import { useEffect, useMemo, useState } from 'react'
import { Alert, App, Button, Drawer, Form, Input, Segmented, Select, Skeleton, Switch, Tag, Typography, Upload } from 'antd'
import {
  ApiOutlined, BgColorsOutlined, CloudUploadOutlined, GlobalOutlined, LinkOutlined,
  PictureOutlined, SaveOutlined, SettingOutlined, ShareAltOutlined, FormOutlined, PlusOutlined,
  DeleteOutlined, ArrowUpOutlined, ArrowDownOutlined, TranslationOutlined,
} from '@ant-design/icons'
import { useSearchParams } from 'react-router-dom'
import { useApiQuery } from '../../hooks/useApiQuery'
import { apiConfigsService, settingsService } from '../../features/settings/settingsService'
import '../../styles/admin/settings.css'

const { Title } = Typography
const DEFAULT_APPEARANCE = { themeMode: 'light', accentColor: '#0284C7' }

const SECTIONS = [
  { key: 'site-info', group: 'general', title: 'Thông tin website', description: 'Tên website, slogan và thông tin liên hệ', icon: <GlobalOutlined />, tone: 'blue' },
  { key: 'branding', group: 'general', title: 'Nhận diện thương hiệu', description: 'Quản lý logo và favicon của website', icon: <PictureOutlined />, tone: 'violet' },
  { key: 'appearance', group: 'general', title: 'Giao diện', description: 'Chế độ hiển thị và màu thương hiệu', icon: <BgColorsOutlined />, tone: 'emerald' },
  { key: 'social', group: 'general', title: 'Mạng xã hội', description: 'Liên kết Facebook và Zalo chính thức', icon: <ShareAltOutlined />, tone: 'rose' },
  { key: 'lead-form', group: 'general', title: 'Form đăng ký tư vấn', description: 'Thêm, xóa và sắp xếp các trường dùng chung trên website', icon: <FormOutlined />, tone: 'emerald' },
  { key: 'n8n', group: 'integration', title: 'n8n Automation', description: 'Webhook tự động hóa và khóa xác thực', icon: <ApiOutlined />, tone: 'amber' },
]

export function AdminSettings() {
  const { message, modal } = App.useApp()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeKey = searchParams.get('section')
  const [saving, setSaving] = useState(false)
  const [translating, setTranslating] = useState(false)
  const [form] = Form.useForm()
  const siteQuery = useApiQuery(() => settingsService.getSiteInfo(), [])
  const appearanceQuery = useApiQuery(() => settingsService.getAppearance(), [])
  const n8nQuery = useApiQuery(() => apiConfigsService.getN8nConfig(), [])
  const leadFormQuery = useApiQuery(() => settingsService.getLeadForm(), [])
  const activeSection = SECTIONS.find((item) => item.key === activeKey)

  const openSection = (key) => setSearchParams({ section: key })
  const closeSection = () => {
    if (form.isFieldsTouched()) {
      modal.confirm({
        title: 'Bỏ các thay đổi chưa lưu?',
        content: 'Những nội dung bạn vừa chỉnh sửa sẽ không được giữ lại.',
        okText: 'Bỏ thay đổi', cancelText: 'Tiếp tục chỉnh sửa',
        onOk: () => { form.resetFields(); setSearchParams({}) },
      })
      return
    }
    setSearchParams({})
  }

  useEffect(() => {
    if (!activeSection) return
    if (activeKey === 'appearance' && appearanceQuery.data) form.setFieldsValue(appearanceQuery.data)
    else if (activeKey === 'n8n' && n8nQuery.data) {
      form.setFieldsValue({
        apiKey: '',
        webhookUrl: n8nQuery.data.extra?.webhookUrl || '',
        isActive: n8nQuery.data.isActive ?? false,
      })
    } else if (activeKey === 'lead-form' && leadFormQuery.data) form.setFieldsValue(leadFormQuery.data)
    else if (siteQuery.data) {
      if (activeKey === 'social') form.setFieldsValue(siteQuery.data.socialLinks || {})
      else form.setFieldsValue(siteQuery.data)
    }
  }, [activeKey, activeSection, appearanceQuery.data, n8nQuery.data, leadFormQuery.data, siteQuery.data, form])

  const loading = siteQuery.loading || appearanceQuery.loading || n8nQuery.loading
  const configured = useMemo(() => ({
    'site-info': Boolean(siteQuery.data?.name && siteQuery.data?.email),
    branding: Boolean(siteQuery.data?.logoUrl),
    appearance: Boolean(appearanceQuery.data?.accentColor),
    social: Boolean(siteQuery.data?.socialLinks?.facebook || siteQuery.data?.socialLinks?.zalo),
    n8n: Boolean(n8nQuery.data?.hasApiKey || n8nQuery.data?.extra?.webhookUrl),
    'lead-form': Boolean(leadFormQuery.data?.fields?.length),
  }), [siteQuery.data, appearanceQuery.data, n8nQuery.data, leadFormQuery.data])

  const save = async () => {
    await form.validateFields()
    const values = form.getFieldsValue(true)
    setSaving(true)
    try {
      if (activeKey === 'appearance') await settingsService.updateAppearance(values)
      else if (activeKey === 'n8n') {
        const payload = { isActive: values.isActive, extra: { webhookUrl: values.webhookUrl } }
        if (values.apiKey) payload.apiKey = values.apiKey
        await apiConfigsService.updateConfig('n8n', payload)
      } else if (activeKey === 'social') {
        await settingsService.updateSiteInfo({ socialLinks: values })
      } else if (activeKey === 'lead-form') {
        const english = values.translations?.en
        const hasEnglishContent = english?.title?.trim() || english?.submitLabel?.trim() || english?.fields?.some((field) => field?.label?.trim() || field?.placeholder?.trim() || field?.options?.some((option) => option?.trim()))
        if (!hasEnglishContent && values.translations) delete values.translations.en
        await settingsService.updateLeadForm({ ...values, version: leadFormQuery.data?.version || 1 })
      } else {
        await settingsService.updateSiteInfo(values)
      }
      form.resetFields()
      await Promise.all([siteQuery.refetch(), appearanceQuery.refetch(), n8nQuery.refetch(), leadFormQuery.refetch()])
      message.success('Đã lưu cấu hình')
      setSearchParams({})
    } catch (error) {
      message.error(error?.error?.message || 'Không lưu được cấu hình')
    } finally { setSaving(false) }
  }

  const translateLeadForm = async () => {
    try {
      const source = await form.validateFields(['title', 'submitLabel', 'fields'])
      setTranslating(true)
      const preview = await settingsService.translateLeadFormPreview(source)
      form.setFieldValue(['translations', 'en'], preview)
      message.success('Đã tạo bản dịch English. Hãy kiểm tra trước khi lưu.')
    } catch (error) {
      if (!error?.errorFields) message.error(error?.error?.message || 'Không thể dịch form bằng Gemini')
    } finally { setTranslating(false) }
  }

  const upload = (field) => ({
    showUploadList: false,
    accept: 'image/png,image/jpeg,image/webp,image/svg+xml,image/x-icon',
    customRequest: async ({ file, onSuccess, onError }) => {
      try {
        const result = await settingsService.uploadAsset(file)
        form.setFieldValue(field, result?.url || result)
        message.success('Đã tải ảnh lên')
        onSuccess?.(result)
      } catch (error) { message.error('Tải ảnh thất bại'); onError?.(error) }
    },
  })

  const resetAppearance = () => {
    form.setFieldsValue(DEFAULT_APPEARANCE)
    message.info('Đã đưa về màu giao diện mặc định. Nhấn “Lưu thay đổi” để áp dụng.')
  }

  const testN8n = async () => {
    try { const result = await apiConfigsService.testConnection('n8n'); message.success(result?.message || 'Kết nối n8n thành công') }
    catch (error) { message.error(error?.error?.message || 'Không thể kết nối n8n') }
  }

  return (
    <div className="settings-page">
      <header className="settings-header">
        <div>
          <Title level={3} className="admin-page-title">Cấu hình hệ thống</Title>
          <p>Quản lý thông tin hiển thị và kết nối vận hành tại một nơi.</p>
        </div>
      </header>

      {loading ? <div className="settings-skeleton"><Skeleton active /><Skeleton active /></div> : (
        <>
          <SettingsGroup title="Cài đặt chung" description="Thông tin và nhận diện hiển thị trên website">
            {SECTIONS.filter((item) => item.group === 'general').map((item) => <SettingsCard key={item.key} item={item} configured={configured[item.key]} onClick={() => openSection(item.key)} />)}
          </SettingsGroup>
          <SettingsGroup title="Kết nối & tích hợp" description="Cấu hình luồng tự động hóa của hệ thống">
            {SECTIONS.filter((item) => item.group === 'integration').map((item) => <SettingsCard key={item.key} item={item} configured={configured[item.key]} onClick={() => openSection(item.key)} />)}
          </SettingsGroup>
        </>
      )}

      <Drawer title={activeSection?.title} open={Boolean(activeSection)} onClose={closeSection} width={560} className="settings-drawer" destroyOnHidden extra={<SettingOutlined />} footer={<div className="settings-drawer-actions"><Button onClick={closeSection}>Hủy</Button><Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={save}>Lưu thay đổi</Button></div>}>
        {activeSection && <Form form={form} layout="vertical" requiredMark={false} className="settings-form"><p className="settings-drawer-description">{activeSection.description}</p><SectionForm section={activeKey} form={form} upload={upload} hasApiKey={n8nQuery.data?.hasApiKey} onTest={testN8n} onResetAppearance={resetAppearance} translating={translating} onTranslateLeadForm={translateLeadForm} /></Form>}
      </Drawer>
    </div>
  )
}

function SettingsGroup({ title, description, children }) {
  return <section className="settings-group"><div className="settings-group-heading"><div><h2>{title}</h2><p>{description}</p></div></div><div className="settings-grid">{children}</div></section>
}

function SettingsCard({ item, configured, onClick }) {
  return <button id={`settings-card-${item.key}`} className="settings-card" onClick={onClick}><span className={`settings-card-icon ${item.tone}`}>{item.icon}</span><span className="settings-card-copy"><span className="settings-card-title">{item.title}</span><span className="settings-card-description">{item.description}</span></span><Tag color={configured ? 'success' : 'default'}>{configured ? 'Đã thiết lập' : 'Chưa hoàn tất'}</Tag><LinkOutlined className="settings-card-arrow" /></button>
}

function SectionForm({ section, form, upload, hasApiKey, onTest, onResetAppearance, translating, onTranslateLeadForm }) {
  if (section === 'site-info') return <><Form.Item name="name" label="Tên website" rules={[{ required: true, message: 'Nhập tên website' }]}><Input placeholder="LOSA247" /></Form.Item><Form.Item name="slogan" label="Slogan"><Input placeholder="Tự động hóa chăm sóc 24/7" /></Form.Item><Form.Item name="hotline" label="Hotline"><Input placeholder="0901 247 247" /></Form.Item><Form.Item name="email" label="Email" rules={[{ type: 'email', message: 'Email không hợp lệ' }]}><Input placeholder="contact@losa247.vn" /></Form.Item><Form.Item name="address" label="Địa chỉ"><Input.TextArea rows={3} /></Form.Item></>
  if (section === 'branding') return <><AssetField form={form} field="logoUrl" label="Logo website" upload={upload('logoUrl')} /><AssetField form={form} field="faviconUrl" label="Favicon" upload={upload('faviconUrl')} /></>
  if (section === 'appearance') return <><Form.Item name="themeMode" label="Chế độ hiển thị"><Segmented block options={[{ label: 'Sáng', value: 'light' }, { label: 'Tối', value: 'dark' }]} /></Form.Item><Form.Item name="accentColor" label="Màu thương hiệu"><Input type="color" className="settings-color-input" /></Form.Item><div className="appearance-default"><span><i style={{ background: DEFAULT_APPEARANCE.accentColor }} /><span><strong>Màu mặc định hiện tại</strong><small>{DEFAULT_APPEARANCE.accentColor}</small></span></span><Button onClick={onResetAppearance}>Khôi phục mặc định</Button></div></>
  if (section === 'social') return <><Form.Item name="facebook" label="Facebook" rules={[{ type: 'url', warningOnly: true, message: 'URL chưa hợp lệ' }]}><Input placeholder="https://facebook.com/..." /></Form.Item><Form.Item name="zalo" label="Zalo" rules={[{ type: 'url', warningOnly: true, message: 'URL chưa hợp lệ' }]}><Input placeholder="https://zalo.me/..." /></Form.Item></>
  if (section === 'lead-form') return <LeadFormBuilder form={form} translating={translating} onTranslate={onTranslateLeadForm} />
  return <><div className="n8n-status"><span><strong>n8n Automation</strong><small>Điều khiển các webhook tự động hóa</small></span><Form.Item name="isActive" valuePropName="checked" noStyle><Switch checkedChildren="Bật" unCheckedChildren="Tắt" /></Form.Item></div><Form.Item name="webhookUrl" label="Webhook URL" rules={[{ required: true, message: 'Nhập webhook URL' }, { type: 'url', message: 'URL không hợp lệ' }]}><Input placeholder="https://n8n.example.com/webhook/..." /></Form.Item><Form.Item name="apiKey" label={`API Key ${hasApiKey ? '— đã cấu hình' : ''}`}><Input.Password placeholder={hasApiKey ? 'Để trống để giữ khóa hiện tại' : 'Nhập API key'} /></Form.Item><Button icon={<ApiOutlined />} onClick={onTest}>Kiểm tra kết nối hiện tại</Button></>
}

function AssetField({ form, field, label, upload }) {
  const value = Form.useWatch(field, form)
  return <div className="asset-field"><div className="asset-preview">{value ? <img src={value} alt={label} /> : <PictureOutlined />}</div><div className="asset-copy"><strong>{label}</strong><span>PNG, JPG, WebP hoặc SVG</span><Upload {...upload}><Button icon={<CloudUploadOutlined />}>{value ? 'Thay ảnh' : 'Tải ảnh lên'}</Button></Upload></div><Form.Item name={field} hidden><Input /></Form.Item></div>
}

const FIELD_TYPES = [{ value: 'text', label: 'Văn bản' }, { value: 'phone', label: 'Số điện thoại' }, { value: 'email', label: 'Email' }, { value: 'textarea', label: 'Nội dung dài' }, { value: 'number', label: 'Số' }, { value: 'select', label: 'Danh sách chọn' }, { value: 'checkbox', label: 'Checkbox' }]
function LeadFormBuilder({ form, translating, onTranslate }) {
  const [locale, setLocale] = useState('vi')
  const sourceFields = form.getFieldValue('fields') || []
  const english = Form.useWatch(['translations', 'en'], form)
  const hasEnglish = Boolean(english?.title?.trim() && english?.submitLabel?.trim() && english?.fields?.length === sourceFields.length && english.fields.every((field) => field?.label?.trim()))
  const hasEnglishContent = Boolean(english?.title?.trim() || english?.submitLabel?.trim() || english?.fields?.some((field) => field?.label?.trim() || field?.placeholder?.trim() || field?.options?.some((option) => option?.trim())))
  const openEnglish = () => {
    const byId = new Map((english?.fields || []).map((field) => [field.id, field]))
    form.setFieldValue(['translations', 'en'], {
      title: english?.title || '',
      submitLabel: english?.submitLabel || '',
      fields: sourceFields.map((field) => byId.get(field.id) || { id: field.id, label: '', placeholder: '', options: (field.options || []).map(() => '') }),
    })
    setLocale('en')
  }
  const englishPanel = <div className="form-language-panel">
    {!hasEnglishContent && <Alert type="info" showIcon message="Các ô English đang để trống" description="Nhấn “Dịch bằng Gemini” để điền toàn bộ nội dung cần dịch, sau đó kiểm tra trước khi lưu." />}
    <div className="form-builder-meta"><Form.Item name={['translations', 'en', 'title']} label="Tiêu đề form" rules={hasEnglishContent ? [{ required: true, message: 'Nhập tiêu đề English' }] : []}><Input placeholder="Để trống hoặc dịch bằng Gemini" /></Form.Item><Form.Item name={['translations', 'en', 'submitLabel']} label="Nhãn nút gửi" rules={hasEnglishContent ? [{ required: true, message: 'Nhập nhãn nút English' }] : []}><Input placeholder="Để trống hoặc dịch bằng Gemini" /></Form.Item></div>
    <div className="form-builder-heading"><strong>Các trường</strong><Tag color={hasEnglish ? 'success' : 'default'}>{hasEnglish ? 'Đã dịch đầy đủ' : `${sourceFields.length} trường cần dịch`}</Tag></div>
    {sourceFields.map((field, index) => <div className="form-field-card" key={field.id}><Form.Item name={['translations', 'en', 'fields', index, 'id']} hidden><Input /></Form.Item><div className="form-field-toolbar"><b>Trường {index + 1}</b><Tag>Chỉ dịch nội dung</Tag></div><div className="form-field-grid"><Form.Item name={['translations', 'en', 'fields', index, 'label']} label="Nhãn" rules={hasEnglishContent ? [{ required: true, message: 'Nhập nhãn English' }] : []}><Input placeholder="Để trống hoặc dịch bằng Gemini" /></Form.Item><Form.Item label="Mã dữ liệu"><Input value={field.key} disabled /></Form.Item><Form.Item label="Loại"><Select value={field.type} options={FIELD_TYPES} disabled /></Form.Item><Form.Item name={['translations', 'en', 'fields', index, 'placeholder']} label="Placeholder"><Input placeholder="Để trống hoặc dịch bằng Gemini" /></Form.Item></div>{field.type === 'select' && <Form.Item name={['translations', 'en', 'fields', index, 'options']} label="Lựa chọn (mỗi dòng một giá trị)" getValueFromEvent={(e) => e.target.value.split('\n')} getValueProps={(value) => ({ value: (value || []).join('\n') })} rules={[{ validator: (_, value) => !hasEnglishContent || (value || []).length === (field.options || []).length ? Promise.resolve() : Promise.reject(new Error('Số lựa chọn English phải khớp Tiếng Việt')) }]}><Input.TextArea rows={3} placeholder="Để trống hoặc dịch bằng Gemini" /></Form.Item>}<div className="form-field-switches form-field-switches--readonly"><label><Switch size="small" checked={field.required} disabled /><span>Bắt buộc</span></label><label><Switch size="small" checked={field.enabled} disabled /><span>Hiển thị</span></label></div></div>)}
  </div>
  return <div className="form-builder"><div className="form-language-header"><nav className="form-language-tabs" aria-label="Ngôn ngữ form"><button id="lead-form-tab-vi" type="button" className={locale === 'vi' ? 'active' : ''} onClick={() => setLocale('vi')}>Tiếng Việt</button><button id="lead-form-tab-en" type="button" className={locale === 'en' ? 'active' : ''} onClick={openEnglish}>English{hasEnglish && <small>Đã có</small>}</button></nav><Button id="lead-form-translate" type="primary" icon={<TranslationOutlined />} loading={translating} onClick={async () => { await onTranslate(); setLocale('en') }}>Dịch bằng Gemini</Button></div>{locale === 'en' ? englishPanel : <><div className="form-builder-meta"><Form.Item name="title" label="Tiêu đề form" rules={[{ required: true }]}><Input /></Form.Item><Form.Item name="submitLabel" label="Nhãn nút gửi" rules={[{ required: true }]}><Input /></Form.Item></div><Form.List name="fields">{(fields, { add, remove, move }) => <><div className="form-builder-heading"><strong>Các trường</strong><Button id="lead-form-add-field" icon={<PlusOutlined />} onClick={() => { const id = `field_${Date.now()}`; add({ id, key: id, type: 'text', label: 'Trường mới', placeholder: '', required: false, enabled: true, options: [] }) }}>Thêm trường</Button></div>{fields.map((item, index) => <div className="form-field-card" key={item.key}><Form.Item name={[item.name, 'id']} hidden><Input /></Form.Item><div className="form-field-toolbar"><b>Trường {index + 1}</b><span><Button type="text" disabled={!index} icon={<ArrowUpOutlined />} onClick={() => move(index, index - 1)} /><Button type="text" disabled={index === fields.length - 1} icon={<ArrowDownOutlined />} onClick={() => move(index, index + 1)} /><Button danger type="text" icon={<DeleteOutlined />} onClick={() => remove(index)} /></span></div><div className="form-field-grid"><Form.Item name={[item.name, 'label']} label="Nhãn" rules={[{ required: true }]}><Input /></Form.Item><Form.Item name={[item.name, 'key']} label="Mã dữ liệu" rules={[{ required: true, pattern: /^[a-z][a-zA-Z0-9_]*$/ }]}><Input /></Form.Item><Form.Item name={[item.name, 'type']} label="Loại"><Select options={FIELD_TYPES} /></Form.Item><Form.Item name={[item.name, 'placeholder']} label="Placeholder"><Input /></Form.Item></div><Form.Item noStyle shouldUpdate={(a, b) => a.fields?.[index]?.type !== b.fields?.[index]?.type}>{() => form.getFieldValue(['fields', index, 'type']) === 'select' ? <Form.Item name={[item.name, 'options']} label="Lựa chọn (mỗi dòng một giá trị)" getValueFromEvent={(e) => e.target.value.split('\n').filter(Boolean)} getValueProps={(value) => ({ value: (value || []).join('\n') })}><Input.TextArea rows={3} /></Form.Item> : null}</Form.Item><div className="form-field-switches"><label><Form.Item name={[item.name, 'required']} valuePropName="checked" noStyle><Switch size="small" /></Form.Item><span>Bắt buộc</span></label><label><Form.Item name={[item.name, 'enabled']} valuePropName="checked" noStyle><Switch size="small" /></Form.Item><span>Hiển thị</span></label></div></div>)}</>}</Form.List></>}</div>
}
