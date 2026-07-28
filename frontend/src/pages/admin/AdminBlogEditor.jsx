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

export function AdminBlogEditor() {
  const { message } = App.useApp()
  const navigate = useNavigate()
  const { state } = useLocation()
  const editing = state?.blog
  const [form] = Form.useForm()
  const coverImageUrl = Form.useWatch('coverImageUrl', form)
  const [saving, setSaving] = useState(false)
  const [titleValue, setTitleValue] = useState(editing?.title || '')
  const [metaDescValue, setMetaDescValue] = useState(editing?.metaDescription || editing?.excerpt || '')
  const [slugValue, setSlugValue] = useState(editing?.slug || '')
  
  const categoriesQuery = useApiQuery(() => blogCategoriesService.getCategories(), [])
  const categoryOptions = (categoriesQuery.data?.items || []).map(c => ({ value: c._id, label: c.name }))

  const tagsQuery = useApiQuery(() => blogTagsService.getTags({ limit: 1000 }), [])
  const tagOptions = (tagsQuery.data?.items || []).map(t => ({ value: t._id, label: t.name }))

  const handleTitleChange = (e) => {
    setTitleValue(e.target.value)
  }
  
  const handleMetaDescChange = (e) => {
    setMetaDescValue(e.target.value)
  }

  const handleSlugChange = (e) => {
    setSlugValue(e.target.value)
  }

  const generateAutoSlug = () => {
    if (!titleValue) return
    const str = titleValue.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, "")
      .replace(/[đĐ]/g, "d")
      .replace(/([^0-9a-z-\s])/g, '')
      .replace(/(\s+)/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
    setSlugValue(str)
    form.setFieldValue('slug', str)
  }

  const onFinish = async (values) => {
    setSaving(true)
    try {
      const payload = {
        ...values,
        excerpt: values.metaDescription, // map metaDescription to excerpt if backend needs it, but backend also has metaDescription now.
      }
      if (editing?._id) await blogsService.updateBlog(editing._id, payload)
      else await blogsService.createBlog(payload)
      message.success('Đã lưu bài viết')
      navigate('/admin/blogs')
    } catch (e) { message.error(e?.error?.message || 'Không lưu được bài viết') }
    finally { setSaving(false) }
  }

  const handleSaveDraft = () => {
    form.setFieldValue('status', 'draft')
    form.submit()
  }

  const handlePublish = () => {
    form.setFieldValue('status', 'published')
    form.submit()
  }

  return (
    <>
      <PageHeader
        title={editing ? 'Sửa bài viết' : 'Viết bài mới'}
        extra={<Button icon={<CloseOutlined />} onClick={() => navigate('/admin/blogs')}>Huỷ</Button>}
      />
      <Form form={form} layout="vertical" onFinish={onFinish}
        initialValues={editing ? { 
          ...editing, 
          category: editing.category?._id || editing.category,
          metaDescription: editing.metaDescription || editing.excerpt,
          allowComments: editing.allowComments ?? true,
          allowIndexing: editing.allowIndexing ?? true,
          showToc: editing.showToc ?? true,
          isFeatured: editing.isFeatured ?? false,
          publishedAt: editing.publishedAt ? dayjs(editing.publishedAt) : undefined,
        } : { 
          status: 'draft',
          allowComments: true,
          allowIndexing: true,
          showToc: true,
          isFeatured: false,
        }}>
        <Row gutter={24}>
          <Col xs={24} lg={16}>
            <Card>
              <Form.Item name="title" label="Tiêu đề bài viết" rules={[{ required: true, message: 'Nhập tiêu đề' }]}>
                <Input size="large" placeholder="Nhập tiêu đề bài viết..." showCount maxLength={100} onChange={handleTitleChange} />
              </Form.Item>
              
              <Form.Item label="Slug (URL)" required>
                <Space.Compact style={{ width: '100%' }}>
                  <Input prefix="https://losa247.vn/blog/" placeholder="nhap-slug-bai-viet" value={slugValue} onChange={(e) => {
                    handleSlugChange(e)
                    form.setFieldValue('slug', e.target.value)
                  }} />
                  <Button onClick={generateAutoSlug}>Tạo tự động</Button>
                </Space.Compact>
                {/* Hidden field for form submission */}
                <Form.Item name="slug" noStyle><Input type="hidden" /></Form.Item>
              </Form.Item>

              <Form.Item name="metaDescription" label="Mô tả ngắn (Meta Description)">
                <Input.TextArea rows={3} placeholder="Nhập mô tả ngắn, tối đa 160 ký tự..." showCount maxLength={160} onChange={handleMetaDescChange} />
              </Form.Item>
              
              <Form.Item name="content" label="Nội dung bài viết" rules={[{ required: true, message: 'Nhập nội dung' }]} trigger="onEditorChange">
                <Editor
                  apiKey="y94yfrtyeua7to4tduqvzo5x5fmeyi8rp89wtrhrlfl8ue40"
                  init={{
                    height: 500,
                    menubar: false,
                    plugins: [
                      'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                      'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                      'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                    ],
                    toolbar: 'blocks fontfamily fontsize lineheight styles | ' +
                      'bold italic underline strikethrough forecolor backcolor code | alignleft aligncenter ' +
                      'alignright alignjustify | bullist numlist outdent indent | ' +
                      'link image media table | removeformat | help',
                    line_height_formats: '1 1.1 1.2 1.3 1.4 1.5 1.6 1.8 2.0 2.5 3.0',
                    style_formats_merge: true,
                    style_formats: [
                      {
                        title: 'Khoảng cách chữ (Letter Spacing)',
                        items: [
                          { title: 'Bình thường', inline: 'span', styles: { 'letter-spacing': 'normal' } },
                          { title: 'Rộng (1px)', inline: 'span', styles: { 'letter-spacing': '1px' } },
                          { title: 'Rộng (2px)', inline: 'span', styles: { 'letter-spacing': '2px' } },
                          { title: 'Rộng (3px)', inline: 'span', styles: { 'letter-spacing': '3px' } },
                          { title: 'Hẹp (-0.5px)', inline: 'span', styles: { 'letter-spacing': '-0.5px' } },
                          { title: 'Hẹp (-1px)', inline: 'span', styles: { 'letter-spacing': '-1px' } }
                        ]
                      }
                    ],
                    content_style: 'body { font-family:"Google Sans Flex",sans-serif,Helvetica,Arial; font-size:16px; line-height: 1.6; color: #101828; } a { color: #0068FF; text-decoration: none; } a:hover { text-decoration: underline; } img { display: block; max-width: 100%; height: auto; margin: 32px auto; border-radius: 12px; } img[style*="float: left"], img[style*="float:left"], img[align="left"] { float: none !important; display: block !important; margin: 32px auto 32px 0 !important; } img[style*="float: right"], img[style*="float:right"], img[align="right"] { float: none !important; display: block !important; margin: 32px 0 32px auto !important; } figure.image { margin: 32px auto; text-align: center; } figure.image img { margin: 0 auto; } figure.image figcaption { margin-top: 12px; font-size: 14px; color: #667085; font-style: italic; text-align: center; }',
                    placeholder: 'Nhập nội dung bài viết...',
                    statusbar: true,
                    file_picker_types: 'image',
                    file_picker_callback: (cb, value, meta) => {
                      const input = document.createElement('input');
                      input.setAttribute('type', 'file');
                      input.setAttribute('accept', 'image/*');

                      input.addEventListener('change', async (e) => {
                        const file = e.target.files[0];
                        if (file) {
                          try {
                            message.loading({ content: 'Đang tải ảnh...', key: 'uploadMCE' });
                            const res = await settingsService.uploadAsset(file);
                            if (res?.url) {
                              cb(res.url, { title: file.name });
                              message.success({ content: 'Tải ảnh thành công', key: 'uploadMCE' });
                            } else {
                              throw new Error('Upload failed');
                            }
                          } catch (error) {
                            message.error({ content: 'Lỗi khi tải ảnh lên', key: 'uploadMCE' });
                          }
                        }
                      });
                      input.click();
                    },
                  }}
                />
              </Form.Item>
            </Card>
            
            <Card title="Xem trước trên Google" style={{ marginTop: 24 }}>
              <div style={{ maxWidth: 600 }}>
                <div style={{ color: '#1a0dab', fontSize: 20, cursor: 'pointer', marginBottom: 2 }}>
                  {titleValue || 'Tiêu đề bài viết sẽ hiển thị ở đây'}
                </div>
                <div style={{ color: '#006621', fontSize: 14, marginBottom: 2 }}>
                  https://losa247.vn/blog/{slugValue || 'nhap-slug-bai-viet'}
                </div>
                <div style={{ color: '#545454', fontSize: 14, lineHeight: 1.5 }}>
                  {metaDescValue || 'Đây là mô tả ngắn của bài viết hiển thị trên kết quả tìm kiếm của Google.'}
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card title="Xuất bản" style={{ position: 'sticky', top: 24 }}>
              <Form.Item name="category" label="Danh mục">
                <Select
                  allowClear
                  placeholder="Chọn danh mục"
                  options={categoryOptions}
                  loading={categoriesQuery.loading}
                  dropdownRender={(menu) => (
                    <>
                      {menu}
                      <div style={{ padding: '8px', borderTop: '1px solid #e8e8e8' }}>
                        <Button type="text" icon={<PlusOutlined />} block onClick={() => navigate('/admin/blogs', { state: { openCategoryForm: true }})}>
                          Thêm danh mục
                        </Button>
                      </div>
                    </>
                  )}
                />
              </Form.Item>

              <Form.Item name="tags" label="Tags">
                <Select mode="multiple" placeholder="Chọn thẻ..." options={tagOptions} loading={tagsQuery.loading} />
              </Form.Item>

              <Form.Item name="coverImageUrl" hidden>
                <Input />
              </Form.Item>
              <Form.Item label="Ảnh đại diện">
                <Upload.Dragger accept="image/png, image/jpeg, image/webp" maxCount={1}
                  showUploadList={false}
                  customRequest={async ({ file, onSuccess, onError }) => {
                    try {
                      const res = await settingsService.uploadAsset(file)
                      if (res?.url) {
                        form.setFieldValue('coverImageUrl', res.url)
                        onSuccess('ok')
                      } else {
                        throw new Error('Upload failed')
                      }
                    } catch (error) {
                      onError(error)
                      message.error('Lỗi khi tải ảnh lên Cloudinary')
                    }
                  }}
                >
                  {coverImageUrl ? (
                    <img src={coverImageUrl} alt="Ảnh đại diện" style={{ width: '100%', maxHeight: 160, objectFit: 'contain', padding: 8 }} />
                  ) : (
                    <>
                      <p className="ant-upload-drag-icon"><UploadOutlined /></p>
                      <p className="ant-upload-text">Kéo thả ảnh vào đây hoặc</p>
                      <Button size="small">Chọn ảnh</Button>
                      <p className="ant-upload-hint">JPEG, PNG, WEBP. Tối đa 2MB</p>
                    </>
                  )}
                </Upload.Dragger>
              </Form.Item>

              <Form.Item name="status" label="Trạng thái">
                <Select options={Object.entries(BLOG_STATUS).map(([value, cfg]) => ({ value, label: cfg.label }))} />
              </Form.Item>

              <Form.Item name="publishedAt" label="Đăng ngay lập tức">
                <DatePicker showTime style={{ width: '100%' }} format="DD/MM/YYYY HH:mm" />
              </Form.Item>



              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <span>Bài viết nổi bật</span>
                <Form.Item name="isFeatured" valuePropName="checked" noStyle><Switch /></Form.Item>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <span>Cho phép bình luận</span>
                <Form.Item name="allowComments" valuePropName="checked" noStyle><Switch /></Form.Item>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <span>Cho phép Google index</span>
                <Form.Item name="allowIndexing" valuePropName="checked" noStyle><Switch /></Form.Item>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <span>Hiển thị mục lục</span>
                <Form.Item name="showToc" valuePropName="checked" noStyle><Switch /></Form.Item>
              </div>

              <Dropdown.Button 
                type="primary" 
                size="large" 
                loading={saving}
                onClick={() => form.submit()}
                menu={{ items: [
                  { key: 'draft', label: 'Lưu nháp', onClick: handleSaveDraft },
                  { key: 'publish', label: 'Xuất bản', onClick: handlePublish }
                ]}}
                style={{ width: '100%' }}
              >
                Lưu bài
              </Dropdown.Button>
            </Card>
          </Col>
        </Row>
      </Form>
    </>
  )
}


// ---- FAQs -----------------------------------------------------------------
