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
  EditOutlined, DeleteOutlined
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

export function AdminServices() {
  return (
    <>
      <PageHeader title="Gói dịch vụ (pricingPlans)" />
      <Tabs items={[
        { key: 'plans', label: 'Gói dịch vụ', children: <PricingPlansTable /> },
        { key: 'comparisons', label: 'Bảng so sánh', children: <PricingComparisonsTable /> },
      ]} />
    </>
  )
}

function PricingPlansTable() {
  const { message } = App.useApp()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form] = Form.useForm()
  const { search, onSearch, debounced } = useListParams()
  const [isActive, setIsActive] = useState('')
  const query = useApiQuery(
    () => pricingService.getPlans({ search: debounced || undefined, isActive }),
    [debounced, isActive],
  )
  const rows = query.data?.items || []

  const openModal = (row) => { 
    setEditing(row || null)
    form.setFieldsValue(row || { name: '', price: '', badge: '', buttonText: '', order: 0, isActive: true, subtitle: [], feature: [] })
    setOpen(true) 
  }
  const submit = async () => {
    const values = await form.validateFields()
    try {
      if (editing?._id) await pricingService.updatePlan(editing._id, values)
      else await pricingService.createPlan(values)
      message.success('Đã lưu gói dịch vụ')
      setOpen(false)
      query.refetch()
    } catch { message.error('Không lưu được gói dịch vụ') }
  }
  const remove = async (row) => { 
    try { await pricingService.deletePlan(row._id); message.success('Đã xoá'); query.refetch() } 
    catch { message.error('Không xoá được') } 
  }
  const toggleActive = async (row, checked) => {
    try { await pricingService.updatePlan(row._id, { isActive: checked }); message.success('Đã cập nhật'); query.refetch() }
    catch { message.error('Lỗi') }
  }

  const columns = [
    { title: 'STT', key: 'stt', render: (_, __, i) => i + 1, width: 60, align: 'center' },
    { title: 'Tên gói', dataIndex: 'name', key: 'name', render: (v) => <span className="cell-strong">{v}</span> },
    { title: 'Giá', dataIndex: 'price', key: 'price' },
    { title: 'Badge', dataIndex: 'badge', key: 'badge', render: (v) => v ? <Tag color="purple">{v}</Tag> : '—' },
    { title: 'Subtitle (số lượng)', dataIndex: 'subtitle', key: 'subtitle', render: (v) => v?.length ? `${v.length} dòng` : '—' },
    { title: 'Features (số lượng)', dataIndex: 'feature', key: 'feature', render: (v) => v?.length ? `${v.length} tính năng` : '—' },
    { title: 'Thứ tự', dataIndex: 'order', key: 'order', align: 'center' },
    { title: 'Trạng thái', dataIndex: 'isActive', key: 'isActive', render: (v, r) => <Switch checked={v} onChange={(c) => toggleActive(r, c)} /> },
    {
      title: 'Thao tác', key: 'action', width: 100, render: (_, r) => (
        <Space>
          <Button size="small" type="text" icon={<EditOutlined style={{ color: '#0d9488' }} />} onClick={() => openModal(r)} />
          <Popconfirm title="Xoá?" onConfirm={() => remove(r)}>
            <Button size="small" type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    },
  ]

  return (
    <>
      <Space style={{ marginBottom: 12 }} wrap>
        <Input.Search allowClear placeholder="Tìm kiếm gói dịch vụ..." value={search} onChange={(e) => onSearch(e.target.value)} style={{ width: 240 }} />
        <Select allowClear placeholder="Tất cả trạng thái" value={isActive} onChange={setIsActive} style={{ width: 160 }} options={[{ label: 'Tất cả', value: '' }, { label: 'Hiển thị', value: 'true' }, { label: 'Đang ẩn', value: 'false' }]} />
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal(null)}>Thêm gói dịch vụ</Button>
      </Space>
      <Table rowKey="_id" loading={query.loading} columns={columns} dataSource={rows} pagination={false} />
      
      <Drawer title={editing ? 'Sửa gói dịch vụ' : 'Thêm gói dịch vụ'} width={500} open={open} onClose={() => setOpen(false)} extra={<Space><Button onClick={() => setOpen(false)}>Hủy</Button><Button type="primary" onClick={submit}>Lưu</Button></Space>}>
        <Form form={form} layout="vertical" key={editing?._id || 'new'}>
          <Form.Item name="name" label="Tên gói" rules={[{ required: true, message: 'Nhập tên gói' }]}><Input /></Form.Item>
          <Form.Item name="price" label="Giá" rules={[{ required: true, message: 'Nhập giá' }]}><Input placeholder="VD: 6.000.000đ / tháng hoặc Liên hệ" /></Form.Item>
          <Form.Item name="badge" label="Badge"><Input placeholder="VD: PHỔ BIẾN NHẤT" /></Form.Item>
          <Form.Item name="buttonText" label="Button Text"><Input placeholder="VD: Bắt đầu ngay" /></Form.Item>
          <Form.Item name="order" label="Thứ tự hiển thị"><InputNumber style={{ width: '100%' }} min={0} /></Form.Item>
          <Form.Item name="isActive" label="Trạng thái" valuePropName="checked"><Switch /></Form.Item>
          
          <div style={{ background: '#f8fafc', padding: 16, borderRadius: 8, marginBottom: 16 }}>
            <div style={{ fontWeight: 500, marginBottom: 8 }}>Subtitle (Nội dung phụ dưới giá)</div>
            <Form.List name="subtitle">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                      <Form.Item {...restField} name={[name]} style={{ margin: 0, width: 400 }}><Input placeholder="Nhập dòng subtitle" /></Form.Item>
                      <CloseOutlined onClick={() => remove(name)} style={{ color: '#ef4444', cursor: 'pointer' }} />
                    </Space>
                  ))}
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>Thêm dòng</Button>
                </>
              )}
            </Form.List>
          </div>

          <div style={{ background: '#f8fafc', padding: 16, borderRadius: 8, marginBottom: 16 }}>
            <div style={{ fontWeight: 500, marginBottom: 8 }}>Features (Tính năng)</div>
            <Form.List name="feature">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                      <Form.Item {...restField} name={[name]} style={{ margin: 0, width: 400 }}><Input placeholder="Nhập tính năng" /></Form.Item>
                      <CloseOutlined onClick={() => remove(name)} style={{ color: '#ef4444', cursor: 'pointer' }} />
                    </Space>
                  ))}
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>Thêm tính năng</Button>
                </>
              )}
            </Form.List>
          </div>
        </Form>
      </Drawer>
    </>
  )
}

function PricingComparisonsTable() {
  const { message } = App.useApp()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form] = Form.useForm()
  
  const plansQ = useApiQuery(() => pricingService.getPlans({}), [])
  const plans = plansQ.data?.items || []

  const query = useApiQuery(() => pricingService.getComparisons(), [])
  const rows = query.data?.items || []

  const openModal = (row) => { 
    setEditing(row || null)
    form.setFieldsValue(row || { title: '', order: 0, values: {} })
    setOpen(true) 
  }

  const submit = async () => {
    const values = await form.validateFields()
    try {
      // Chuyển đổi các values nhập vào (nếu là chuỗi 'true'/'false' -> boolean)
      const formattedValues = { ...values.values }
      for (const key in formattedValues) {
        let val = formattedValues[key];
        if (Array.isArray(val) && val.length > 0) val = val[0]; // Extract string from tag array
        if (val === 'true') formattedValues[key] = true
        else if (val === 'false') formattedValues[key] = false
        else formattedValues[key] = val
      }
      values.values = formattedValues

      if (editing?._id) await pricingService.updateComparison(editing._id, values)
      else await pricingService.createComparison(values)
      message.success('Đã lưu dòng so sánh')
      setOpen(false)
      query.refetch()
    } catch { message.error('Không lưu được dòng so sánh') }
  }

  const remove = async (row) => { 
    try { await pricingService.deleteComparison(row._id); message.success('Đã xoá'); query.refetch() } 
    catch { message.error('Không xoá được') } 
  }

  // Generate dynamic columns based on active plans
  const dynamicCols = plans.map(plan => ({
    title: plan.name,
    dataIndex: ['values', plan._id],
    key: plan._id,
    render: (val) => {
      if (typeof val === 'boolean') {
        return val ? <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓</span> : <span style={{ color: '#94a3b8' }}>-</span>
      }
      return val || '—'
    }
  }))

  const columns = [
    { title: 'STT', key: 'stt', render: (_, __, i) => i + 1, width: 60, align: 'center' },
    { title: 'Tiêu đề', dataIndex: 'title', key: 'title', render: (v) => <span className="cell-strong">{v}</span> },
    ...dynamicCols,
    { title: 'Thứ tự', dataIndex: 'order', key: 'order', align: 'center' },
    {
      title: 'Thao tác', key: 'action', width: 100, render: (_, r) => (
        <Space>
          <Button size="small" type="text" icon={<EditOutlined style={{ color: '#0d9488' }} />} onClick={() => openModal(r)} />
          <Popconfirm title="Xoá?" onConfirm={() => remove(r)}>
            <Button size="small" type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    },
  ]

  return (
    <>
      <Space style={{ marginBottom: 12 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal(null)}>Thêm dòng so sánh</Button>
      </Space>
      <Table rowKey="_id" loading={query.loading || plansQ.loading} columns={columns} dataSource={rows} pagination={false} />
      
      <Drawer title={editing ? 'Sửa dòng so sánh' : 'Thêm dòng so sánh'} width={500} open={open} onClose={() => setOpen(false)} extra={<Space><Button onClick={() => setOpen(false)}>Hủy</Button><Button type="primary" onClick={submit}>Lưu</Button></Space>}>
        <Form form={form} layout="vertical" key={editing?._id || 'new'}>
          <Form.Item name="title" label="Tiêu đề (VD: Thời hạn sử dụng, Số trang...)" rules={[{ required: true, message: 'Nhập tiêu đề' }]}><Input /></Form.Item>
          
          <div style={{ background: '#f8fafc', padding: 16, borderRadius: 8, marginBottom: 16 }}>
            <div style={{ fontWeight: 500, marginBottom: 16 }}>Giá trị của từng gói dịch vụ</div>
            {plans.map(plan => (
              <Row key={plan._id} style={{ marginBottom: 12 }}>
                <Col span={8} style={{ display: 'flex', alignItems: 'center' }}>
                  <strong>{plan.name}</strong>
                </Col>
                <Col span={16}>
                  <Form.Item name={['values', plan._id]} style={{ margin: 0 }}>
                    <Select
                      mode="tags"
                      maxCount={1}
                      placeholder="Nhập giá trị, hoặc chọn ✓ / -"
                      options={[
                        { label: '✓ (Có)', value: 'true' },
                        { label: '- (Không)', value: 'false' }
                      ]}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
              </Row>
            ))}
          </div>
          
          <Form.Item name="order" label="Thứ tự hiển thị"><InputNumber style={{ width: '100%' }} min={0} /></Form.Item>
        </Form>
      </Drawer>
    </>
  )
}

