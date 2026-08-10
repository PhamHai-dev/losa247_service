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

export function AdminSettings() {
  return (
    <>
      <PageHeader title="Cấu hình hệ thống" />
      <Tabs items={[
        { key: 'appearance', label: 'Giao diện', children: <AppearanceTab /> },
        { key: 'site', label: 'Thông tin website', children: <SiteInfoTab /> },
        { key: 'api', label: 'Cấu hình API', children: <ApiConfigsTab /> },
      ]} />
    </>
  )
}

function AppearanceTab() {
  const { message } = App.useApp()
  const query = useApiQuery(() => settingsService.getAppearance(), [])
  const [form] = Form.useForm()
  const save = async () => {
    const values = await form.validateFields()
    try { await settingsService.updateAppearance(values); message.success('Đã lưu giao diện') } catch { message.error('Không lưu được') }
  }
  return (
    <Card style={{ maxWidth: 520 }}>
      <QueryState loading={query.loading} error={query.error}>
        <Form form={form} layout="vertical" initialValues={query.data || { themeMode: 'light', primaryColor: '#0F766E' }}>
          <Form.Item name="themeMode" label="Chế độ"><Segmented options={[{ label: 'Sáng', value: 'light' }, { label: 'Tối', value: 'dark' }]} /></Form.Item>
          <Form.Item name="primaryColor" label="Màu thương hiệu"><Input type="color" style={{ width: 80, padding: 2 }} /></Form.Item>
          <Button type="primary" onClick={save}>Lưu thay đổi</Button>
        </Form>
      </QueryState>
    </Card>
  )
}

function SiteInfoTab() {
  const { message } = App.useApp()
  const query = useApiQuery(() => settingsService.getSiteInfo(), [])
  const [form] = Form.useForm()

  useEffect(() => {
    if (query.data) {
      form.setFieldsValue(query.data)
    }
  }, [query.data, form])

  const save = async () => {
    const values = await form.validateFields()
    try { await settingsService.updateSiteInfo(values); message.success('Đã lưu thông tin site') } catch { message.error('Không lưu được') }
  }
  const uploadProps = {
    showUploadList: false,
    customRequest: async ({ file, onSuccess, onError }) => {
      try { const res = await settingsService.uploadAsset(file); form.setFieldValue('logoUrl', res?.url || res); message.success('Đã tải lên'); onSuccess?.(res) }
      catch (e) { message.error('Tải lên thất bại'); onError?.(e) }
    },
  }
  return (
    <Card style={{ maxWidth: 520 }}>
      <QueryState loading={query.loading} error={query.error}>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Tên website"><Input placeholder="LOSA247.VN" /></Form.Item>
          <Form.Item name="slogan" label="Slogan"><Input /></Form.Item>
          <Form.Item name="logoUrl" label="Logo (URL)"><Input placeholder="https://..." /></Form.Item>
          <Upload {...uploadProps}><Button icon={<UploadOutlined />}>Tải logo lên</Button></Upload>
          <div style={{ marginTop: 16 }}><Button type="primary" onClick={save}>Lưu thông tin</Button></div>
        </Form>
      </QueryState>
    </Card>
  )
}

function ApiConfigsTab() {
  const { message } = App.useApp()
  const query = useApiQuery(() => apiConfigsService.getConfigs(), [])
  const configs = query.data || []
  const providers = ['facebook', 'zalo', 'openai', 'anthropic', 'n8n']

  const test = async (provider) => {
    try { const res = await apiConfigsService.testConnection(provider); message.success(res?.message || `Kết nối ${provider} OK`) }
    catch (e) { message.error(e?.error?.message || `Kết nối ${provider} thất bại`) }
  }

  return (
    <QueryState loading={query.loading} error={query.error}>
      <Row gutter={[16, 16]}>
        {providers.map((p) => {
          const cfg = configs.find((c) => c.provider === p) || {}
          return <Col xs={24} md={12} key={p}><ApiConfigCard provider={p} config={cfg} onTest={() => test(p)} onSaved={query.refetch} /></Col>
        })}
      </Row>
    </QueryState>
  )
}

function ApiConfigCard({ provider, config, onTest, onSaved }) {
  const { message } = App.useApp()
  const [form] = Form.useForm()
  const save = async () => {
    const values = await form.validateFields()
    try { await apiConfigsService.updateConfig(provider, values); message.success(`Đã lưu ${provider}`); onSaved?.() }
    catch { message.error('Không lưu được cấu hình') }
  }
  return (
    <Card title={provider.toUpperCase()} extra={<Button size="small" onClick={onTest}>Test kết nối</Button>}>
      <Form form={form} layout="vertical" initialValues={{ apiKey: config.apiKey || '', isActive: config.isActive ?? false }}>
        <Form.Item name="apiKey" label="API Key"><Input.Password placeholder="••••••" /></Form.Item>
        <Form.Item name="isActive" label="Kích hoạt" valuePropName="checked"><Switch /></Form.Item>
        <Button type="primary" size="small" onClick={save}>Lưu</Button>
      </Form>
    </Card>
  )
}
