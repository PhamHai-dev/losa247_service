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

export function AdminFaqs() {
  const { message } = App.useApp()
  const [editing, setEditing] = useState(null)
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('home')
  const [selectedServiceDetail, setSelectedServiceDetail] = useState(null)
  const [form] = Form.useForm()
  
  const { search, onSearch, debounced, page, setPage, pageSize } = useListParams()
  
  const handleTabChange = (key) => {
    setActiveTab(key)
    setPage(1)
    if (key !== 'solutions' && key !== 'pricing') {
      setSelectedServiceDetail(null)
    }
  }

  const query = useApiQuery(
    () => faqsService.getFaqs({ search: debounced || undefined, page, limit: pageSize, pageType: activeTab, serviceDetail: selectedServiceDetail || undefined }),
    [debounced, page, activeTab, selectedServiceDetail],
  )
  const rows = query.data?.items || []
  const total = query.data?.pagination?.total || 0



  const openModal = (row) => { 
    setEditing(row || null)
    setOpen(true) 
  }
  
  const submit = async () => {
    const values = await form.validateFields()
    // Loại bỏ field rỗng/null để không gửi '' cho các field.
    const payload = Object.fromEntries(Object.entries(values).filter(([, v]) => v !== '' && v != null))
    try {
      if (editing?._id) await faqsService.updateFaq(editing._id, payload)
      else await faqsService.createFaq(payload)
      message.success('Đã lưu FAQ'); setOpen(false); query.refetch()
    } catch (e) { message.error(e?.error?.message || 'Không lưu được FAQ') }
  }
  
  const remove = async (row) => {
    try { await faqsService.deleteFaq(row._id); message.success('Đã xoá'); query.refetch() } catch { message.error('Không xoá được') }
  }
  
  const move = async (index, dir) => {
    const next = [...rows]
    const target = index + dir
    if (target < 0 || target >= next.length) return
      ;[next[index], next[target]] = [next[target], next[index]]
    try { await faqsService.reorder(next.map((f) => f._id)); message.success('Đã cập nhật thứ tự'); query.refetch() }
    catch { message.error('Không cập nhật được thứ tự') }
  }

  const columns = [
    {
      title: '#', key: 'order', width: 90, render: (_, __, i) => (
        <Space>
          <Button size="small" disabled={i === 0} onClick={() => move(i, -1)}>↑</Button>
          <Button size="small" disabled={i === rows.length - 1} onClick={() => move(i, 1)}>↓</Button>
        </Space>
      )
    },
    { title: 'Câu hỏi', dataIndex: 'question', key: 'question', render: (v) => <span className="cell-strong">{v}</span> },
    { title: 'Dịch vụ', dataIndex: 'serviceDetail', key: 'serviceDetail', render: (v) => v === 'chatbot' ? 'Chatbot' : v === 'crm' ? 'CRM' : v === 'marketing' ? 'Marketing' : '—' },
    {
      title: 'Thao tác', key: 'action', width: 100, render: (_, r) => (
        <Space>
          <Button size="small" type="text" icon={<EditOutlined style={{ color: '#0d9488' }} />} onClick={() => openModal(r)} />
          <Popconfirm title="Xoá FAQ?" onConfirm={() => remove(r)}>
            <Button size="small" type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    },
  ]

  return (
    <>
      <PageHeader title="Quản lý Hỏi đáp" extra={
        <Space wrap>
          <Input.Search allowClear placeholder="Tìm câu hỏi" value={search} onChange={(e) => onSearch(e.target.value)} style={{ width: 240 }} />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal(null)}>Tạo FAQ</Button>
        </Space>} />
        
      <Tabs activeKey={activeTab} onChange={handleTabChange} items={[
        { key: 'home', label: 'Trang chủ' },
        { key: 'solutions', label: 'Giải pháp' },
        { key: 'pricing', label: 'Bảng giá' },
        { key: 'blog', label: 'Blog' },
      ]} />

      <div style={{ marginBottom: 16 }}>
        {(activeTab === 'solutions' || activeTab === 'pricing') && (
          <Select allowClear placeholder="Lọc theo Dịch vụ" style={{ width: 240 }} value={selectedServiceDetail} onChange={(v) => { setSelectedServiceDetail(v); setPage(1); }}>
            <Select.Option value="chatbot">Chatbot</Select.Option>
            <Select.Option value="crm">CRM</Select.Option>
            <Select.Option value="marketing">Marketing</Select.Option>
          </Select>
        )}
      </div>

      {query.error && <Alert type="error" showIcon title={query.error} style={{ marginBottom: 12 }} />}
      <Table rowKey="_id" loading={query.loading} columns={columns} dataSource={rows}
        pagination={{ current: page, pageSize, total, onChange: setPage, showSizeChanger: false }} />
        
      <Modal title={editing ? 'Sửa FAQ' : 'Tạo FAQ'} open={open} onOk={submit} onCancel={() => setOpen(false)} destroyOnHidden>
        <Form form={form} layout="vertical" key={editing?._id || 'new'} initialValues={editing || { question: '', answer: '', page: activeTab, serviceDetail: selectedServiceDetail }}>
          <Form.Item name="page" label="Trang hiển thị" rules={[{ required: true, message: 'Vui lòng chọn trang hiển thị' }]}>
            <Select>
              <Select.Option value="home">Trang chủ</Select.Option>
              <Select.Option value="solutions">Giải pháp</Select.Option>
              <Select.Option value="pricing">Bảng giá</Select.Option>
              <Select.Option value="blog">Blog</Select.Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            noStyle
            shouldUpdate={(prev, curr) => prev.page !== curr.page}
          >
            {({ getFieldValue }) => {
              const p = getFieldValue('page')
              if (p === 'solutions' || p === 'pricing') {
                return (
                  <Form.Item name="serviceDetail" label="Dịch vụ chi tiết">
                    <Select allowClear placeholder="Chọn dịch vụ (Tuỳ chọn)">
                      <Select.Option value="chatbot">Chatbot</Select.Option>
                      <Select.Option value="crm">CRM</Select.Option>
                      <Select.Option value="marketing">Marketing</Select.Option>
                    </Select>
                  </Form.Item>
                )
              }
              return null
            }}
          </Form.Item>
          
          <Form.Item name="question" label="Câu hỏi" rules={[{ required: true, message: 'Nhập câu hỏi' }]}><Input /></Form.Item>
          <Form.Item name="answer" label="Trả lời" rules={[{ required: true, message: 'Nhập câu trả lời' }]}><Input.TextArea rows={4} /></Form.Item>
        </Form>
      </Modal>
    </>
  )
}

// ---- Services (Pricing Plans & Comparisons) -------------------------------------------
