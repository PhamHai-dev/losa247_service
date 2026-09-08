import { useMemo, useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import EmojiPicker from 'emoji-picker-react'
import {
  Alert, App, Button, Card, Col, Descriptions, Drawer, Empty, Form, Input, InputNumber, List,
  Modal, Popconfirm, Row, Segmented, Select, Space, Spin, Statistic, Steps, Switch, Table,
  Tag, Timeline, Typography, Upload, DatePicker,
} from 'antd'
import { Editor } from '@tinymce/tinymce-react'
import '../../styles/admin/blogs.css'
import {
  DownloadOutlined, PlusOutlined, ReloadOutlined, SettingOutlined, UploadOutlined, LikeOutlined, DislikeOutlined, CloseOutlined,
  FileTextOutlined, CheckCircleOutlined, ClockCircleOutlined, EyeOutlined, SmileOutlined, PictureOutlined, PaperClipOutlined, RobotOutlined, FullscreenOutlined, FullscreenExitOutlined
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
import dayjs from 'dayjs'

const { Title, Text } = Typography

// ---- Reusable bits --------------------------------------------------------
function PageHeader({ title, extra }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, gap: 16, flexWrap: 'wrap' }}>
      <div>
        <Title level={3} className="admin-page-title">{title}</Title>
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

export function AdminBlogEditor() {
  const { message } = App.useApp()
  const navigate = useNavigate()
  const { state } = useLocation()
  const editing = state?.blog
  const [form] = Form.useForm()
  const [saving, setSaving] = useState(false)
  const [translating, setTranslating] = useState(false)
  const [activeLocale, setActiveLocale] = useState('vi')
  const [isEditorFullscreen, setIsEditorFullscreen] = useState(false)
  const editorRef = useRef(null)
  const coverImageUrl = Form.useWatch('coverImageUrl', form)
  const activeTranslation = Form.useWatch(['translations', activeLocale], form) || {}

  useEffect(() => {
    const scrollContainer = document.querySelector('.admin-content')
    if (scrollContainer) scrollContainer.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [editing?._id])

  const categoriesQuery = useApiQuery(() => blogCategoriesService.getCategories(), [])
  const categoryOptions = (categoriesQuery.data?.items || [])
    .filter(category => category.translations?.[activeLocale]?.name)
    .map(category => ({ value: category._id, label: category.translations[activeLocale].name }))
  const tagsQuery = useApiQuery(() => blogTagsService.getTags({ limit: 1000 }), [])
  const tagOptions = (tagsQuery.data?.items || [])
    .filter(tag => tag.translations?.[activeLocale]?.name)
    .map(tag => ({ value: tag._id, label: tag.translations[activeLocale].name }))

  const existingTranslations = editing?.translations || {}
  const initialValues = editing ? {
    coverImageUrl: editing.coverImageUrl,
    category: editing.category?._id || editing.category,
    tags: (editing.tags || []).map(tag => tag._id || tag),
    source: editing.source === 'writer' || editing.source === 'manual' ? 'writer' : 'other',
    isFeatured: editing.isFeatured ?? false,
    allowComments: editing.allowComments ?? true,
    translations: Object.fromEntries(Object.entries(existingTranslations).map(([locale, value]) => [locale, {
      ...value,
      publishedAt: value.publishedAt ? dayjs(value.publishedAt) : undefined,
    }])),
  } : {
    source: 'writer', isFeatured: false, allowComments: true,
    translations: { vi: { status: 'draft', allowIndexing: true, showToc: true } },
  }

  const slugifyTitle = () => {
    const title = form.getFieldValue(['translations', activeLocale, 'title'])
    if (!title) return
    const slug = title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd')
      .replace(/([^0-9a-z-\s])/g, '').replace(/(\s+)/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '')
    form.setFieldValue(['translations', activeLocale, 'slug'], slug)
  }

  const cleanTranslation = (value) => {
    if (!value) return undefined
    const publishedAt = value.publishedAt
      ? (typeof value.publishedAt.toISOString === 'function' ? value.publishedAt.toISOString() : new Date(value.publishedAt).toISOString())
      : null
    return {
      ...value,
      title: String(value.title || '').trim(),
      slug: String(value.slug || '').trim() || undefined,
      excerpt: String(value.excerpt || value.metaDescription || ''),
      metaDescription: String(value.metaDescription || ''),
      content: String(value.content || ''),
      publishedAt,
    }
  }

  const onFinish = async () => {
    setSaving(true)
    try {
      const values = form.getFieldsValue(true)
      const translations = { vi: cleanTranslation(values.translations?.vi) }
      if (values.translations?.en?.title || existingTranslations.en) translations.en = cleanTranslation(values.translations?.en)
      const payload = { ...values, translations }
      if (editing?._id) await blogsService.updateBlog(editing._id, payload)
      else await blogsService.createBlog(payload)
      message.success('Đã lưu bài viết song ngữ')
      navigate('/admin/blogs')
    } catch (e) {
      message.error(e?.error?.message || e?.message || 'Không lưu được bài viết')
    } finally { setSaving(false) }
  }


  const generateEnglishPreview = async () => {
    const source = form.getFieldValue(['translations', 'vi']) || {}
    if (!source.title || !source.content) {
      message.warning('Vui lòng nhập tiêu đề và nội dung Tiếng Việt trước')
      setActiveLocale('vi')
      return
    }
    setTranslating(true)
    try {
      const preview = await blogsService.translatePreview({
        title: source.title,
        excerpt: source.excerpt || source.metaDescription || '',
        metaDescription: source.metaDescription || '',
        content: source.content,
      })
      form.setFieldValue(['translations', 'en'], {
        ...(form.getFieldValue(['translations', 'en']) || {}),
        ...preview,
        status: 'draft',
        publishedAt: null,
        allowIndexing: true,
        showToc: source.showToc ?? true,
      })
      message.success('Đã tạo bản dịch preview. Hãy kiểm tra kỹ trước khi lưu.')
    } catch (e) {
      message.error(e?.error?.message || e?.response?.data?.error?.message || e?.message || 'Không tạo được bản dịch Gemini')
    } finally { setTranslating(false) }
  }

  const deleteEnglish = async () => {
    if (!editing?._id || !existingTranslations.en) {
      form.setFieldValue(['translations', 'en'], undefined)
      setActiveLocale('vi')
      return
    }
    try {
      await blogsService.deleteTranslation(editing._id, 'en')
      form.setFieldValue(['translations', 'en'], undefined)
      message.success('Đã xóa bản English')
      navigate('/admin/blogs')
    } catch (e) { message.error(e?.response?.data?.error?.message || 'Không xóa được bản English') }
  }

  const translationPanel = (locale) => {
    const isVi = locale === 'vi'
    const prefix = isVi ? 'https://losa247.vn/blog/' : 'https://losa247.vn/en/blog/'
    return <>
      <Form.Item name={['translations', locale, 'title']} label={isVi ? 'Tiêu đề bài viết' : 'Article title'} rules={isVi ? [{ required: true, message: 'Nhập tiêu đề' }] : []}>
        <Input size="large" placeholder={isVi ? 'Nhập tiêu đề bài viết...' : 'Enter the English article title...'} showCount maxLength={500} />
      </Form.Item>
      <Form.Item label="Slug (URL)">
        <Space.Compact style={{ width: '100%' }}>
          <Form.Item name={['translations', locale, 'slug']} noStyle><Input prefix={prefix} placeholder={isVi ? 'slug-bai-viet' : 'article-slug'} /></Form.Item>
          <Button onClick={slugifyTitle}>Tạo tự động</Button>
        </Space.Compact>
      </Form.Item>
      <Form.Item name={['translations', locale, 'metaDescription']} label="Meta Description">
        <Input.TextArea rows={3} placeholder={isVi ? 'Mô tả ngắn, tối đa 160 ký tự...' : 'English search description...'} showCount maxLength={160} />
      </Form.Item>
      <Form.Item label={isVi ? 'Nội dung bài viết' : 'Article content'} required={isVi}>
        <div style={{ position: 'relative' }}>
          <Button
            id={`blog-editor-fullscreen-${locale}`}
            type="text"
            icon={isEditorFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
            aria-label={isEditorFullscreen ? 'Thu nhỏ trình soạn thảo' : 'Mở rộng trình soạn thảo'}
            title={isEditorFullscreen ? 'Thu nhỏ trình soạn thảo' : 'Mở rộng trình soạn thảo'}
            onClick={() => editorRef.current?.execCommand('mceFullScreen')}
            className={`blog-editor-fullscreen-toggle${isEditorFullscreen ? ' is-fullscreen' : ''}`}
            style={{
              position: isEditorFullscreen ? 'fixed' : 'absolute',
              zIndex: 2000,
            }}
          />
          <Form.Item name={['translations', locale, 'content']} rules={isVi ? [{ required: true, message: 'Nhập nội dung' }] : []} trigger="onEditorChange" noStyle>
          <Editor apiKey="y94yfrtyeua7to4tduqvzo5x5fmeyi8rp89wtrhrlfl8ue40" onInit={(_, editor) => {
            editorRef.current = editor
            editor.on('FullscreenStateChanged', (event) => setIsEditorFullscreen(event.state))
          }} init={{
          height: 600, menubar: false,
          plugins: ['advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview', 'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen', 'insertdatetime', 'media', 'table', 'help', 'wordcount'],
          toolbar: 'blocks fontfamily fontsize lineheight styles | bold italic underline strikethrough forecolor backcolor code | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image media table | removeformat help',
          toolbar_mode: 'sliding',
          quickbars_image_toolbar: 'alignleft aligncenter alignright | imageoptions',
          object_resizing: 'img',
          resize_img_proportional: true,
          image_advtab: true,
          content_style: 'body { font-family:"Google Sans Flex",sans-serif; font-size:16px; line-height:1.6; color:#101828 } img { max-width:100%; height:auto; margin-top:24px; margin-bottom:24px; border-radius:12px } p { clear:both; }',
          placeholder: isVi ? 'Nhập nội dung bài viết...' : 'Write the English article...',
          file_picker_types: 'image',
          file_picker_callback: (cb) => {
            const input = document.createElement('input'); input.type = 'file'; input.accept = 'image/*'
            input.addEventListener('change', async (event) => {
              const file = event.target.files[0]; if (!file) return
              try { const res = await settingsService.uploadAsset(file); if (!res?.url) throw new Error(); cb(res.url, { title: file.name }); message.success('Tải ảnh thành công') }
              catch { message.error('Lỗi khi tải ảnh lên') }
            }); input.click()
          },
        }} />
          </Form.Item>
        </div>
      </Form.Item>
      <Card title="Xem trước trên Google" size="small">
        <div style={{ color: '#1a0dab', fontSize: 20 }}>{activeTranslation.title || (isVi ? 'Tiêu đề bài viết' : 'English article title')}</div>
        <div style={{ color: '#006621', wordBreak: 'break-all' }}>{prefix}{activeTranslation.slug || 'slug'}</div>
        <div style={{ color: '#545454' }}>{activeTranslation.metaDescription || (isVi ? 'Mô tả tìm kiếm của bài viết.' : 'English search description.')}</div>
      </Card>
    </>
  }

  return <>
    <PageHeader title={editing ? 'Sửa bài viết song ngữ' : 'Viết bài mới'} extra={<Button icon={<CloseOutlined />} onClick={() => navigate('/admin/blogs')}>Huỷ</Button>} />
    <Form className="blog-editor-form" form={form} layout="vertical" onFinish={onFinish} initialValues={initialValues}>
      <Row className="blog-editor-columns" gutter={24}>
        <Col className="blog-editor-column blog-editor-column--content" xs={24} lg={16}>
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 22 }}>
              <nav className="blog-language-tabs" aria-label="Ngôn ngữ bài viết" style={{ marginBottom: 0 }}>
                <button id="blog-language-tab-vi" type="button" className={activeLocale === 'vi' ? 'active' : ''} onClick={() => setActiveLocale('vi')}>
                  <span>Tiếng Việt</span>
                </button>
                <button id="blog-language-tab-en" type="button" className={activeLocale === 'en' ? 'active' : ''} onClick={() => setActiveLocale('en')}>
                  <span>English</span>{existingTranslations.en && <small>Đã có</small>}
                </button>
              </nav>
              {activeLocale === 'en' && (
                <Button id="generate-english-preview" type="primary" icon={<RobotOutlined />} loading={translating} onClick={generateEnglishPreview}>
                  Dịch bằng Gemini
                </Button>
              )}
            </div>
            <div className="blog-language-panel" key={activeLocale}>{translationPanel(activeLocale)}</div>
          </Card>
        </Col>
        <Col className="blog-editor-column blog-editor-column--publish" xs={24} lg={8}>
          <Card className="blog-publish-card" title={`Xuất bản · ${activeLocale === 'vi' ? 'Tiếng Việt' : 'English'}`}>
            <Alert type="info" showIcon message="Trạng thái và lịch đăng áp dụng riêng cho ngôn ngữ đang chọn." style={{ marginBottom: 16 }} />
            <Form.Item name="category" label="Danh mục"><Select allowClear placeholder="Chọn danh mục" options={categoryOptions} loading={categoriesQuery.loading} /></Form.Item>
            <Form.Item name="tags" label="Tags"><Select mode="multiple" placeholder="Chọn thẻ..." options={tagOptions} loading={tagsQuery.loading} /></Form.Item>
            <Form.Item name="source" label="Nguồn bài viết" rules={[{ required: true, message: 'Chọn nguồn' }]}><Select options={[{ value: 'writer', label: 'Writer' }, { value: 'other', label: 'Khác' }]} /></Form.Item>
            <Form.Item name="coverImageUrl" hidden><Input /></Form.Item>
            <Form.Item label="Ảnh đại diện">
              <Upload.Dragger accept="image/png,image/jpeg,image/webp" maxCount={1} showUploadList={false} customRequest={async ({ file, onSuccess, onError }) => {
                try { const res = await settingsService.uploadAsset(file); if (!res?.url) throw new Error(); form.setFieldValue('coverImageUrl', res.url); onSuccess('ok') }
                catch (error) { onError(error); message.error('Lỗi khi tải ảnh lên') }
              }}>
                {coverImageUrl ? <img src={coverImageUrl} alt="Ảnh đại diện" style={{ width: '100%', maxHeight: 180, objectFit: 'contain' }} /> : <><p className="ant-upload-drag-icon"><UploadOutlined /></p><p>Kéo thả hoặc chọn ảnh</p></>}
              </Upload.Dragger>
            </Form.Item>
            <Form.Item name={['translations', activeLocale, 'status']} label="Trạng thái"><Select options={Object.entries(BLOG_STATUS).map(([value, cfg]) => ({ value, label: cfg.label }))} /></Form.Item>
            <Form.Item noStyle shouldUpdate={(prev, next) => prev.translations?.[activeLocale]?.status !== next.translations?.[activeLocale]?.status}>
              {() => form.getFieldValue(['translations', activeLocale, 'status']) === 'scheduled' && <Form.Item name={['translations', activeLocale, 'publishedAt']} label="Thời gian xuất bản" rules={[{ required: true, message: 'Chọn thời gian đăng' }]}><DatePicker showTime style={{ width: '100%' }} format="DD/MM/YYYY HH:mm" /></Form.Item>}
            </Form.Item>
            <div style={{ display: 'grid', gap: 14, marginBottom: 20 }}>
              <span>Cho phép Google index <Form.Item name={['translations', activeLocale, 'allowIndexing']} valuePropName="checked" noStyle><Switch style={{ float: 'right' }} /></Form.Item></span>
              <span>Hiển thị mục lục <Form.Item name={['translations', activeLocale, 'showToc']} valuePropName="checked" noStyle><Switch style={{ float: 'right' }} /></Form.Item></span>
              <span>Bài viết nổi bật <Form.Item name="isFeatured" valuePropName="checked" noStyle><Switch style={{ float: 'right' }} /></Form.Item></span>
              <span>Cho phép bình luận <Form.Item name="allowComments" valuePropName="checked" noStyle><Switch style={{ float: 'right' }} /></Form.Item></span>
            </div>
            <Button type="primary" size="large" loading={saving} onClick={() => form.submit()} block>Lưu bài</Button>
            {activeLocale === 'en' && (existingTranslations.en || form.getFieldValue(['translations', 'en', 'title'])) && <Popconfirm title="Xóa bản English?" description="Bản tiếng Việt và dữ liệu dùng chung không bị ảnh hưởng." onConfirm={deleteEnglish}><Button danger block style={{ marginTop: 12 }}>Xóa bản English</Button></Popconfirm>}
          </Card>
        </Col>
      </Row>
    </Form>
  </>
}


// ---- FAQs -----------------------------------------------------------------
