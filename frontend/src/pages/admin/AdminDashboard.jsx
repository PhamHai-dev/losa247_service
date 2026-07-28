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

export function AdminDashboard() {
  const kpisQ = useApiQuery(() => dashboardService.getKpis(), [])
  const revenueQ = useApiQuery(() => dashboardService.getRevenueChart('30d'), [])
  const sourcesQ = useApiQuery(() => dashboardService.getLeadSources(), [])

  const kpi = kpisQ.data?.data || {}
  const revenue = revenueQ.data?.data || []
  const sources = sourcesQ.data?.data || []
  const maxRevenue = Math.max(1, ...revenue.map((r) => r.revenue || 0))

  return (
    <>
      <PageHeader
        title="Dashboard tổng quan"
        extra={<Button icon={<ReloadOutlined />} onClick={() => { kpisQ.refetch(); revenueQ.refetch(); sourcesQ.refetch() }}>Làm mới</Button>}
      />
      <Spin spinning={kpisQ.loading}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={8}><Card><Statistic title="Lead mới trong tháng" value={kpi.newLeads ?? 0} prefix="⚡" /></Card></Col>
          <Col xs={24} sm={12} lg={8}><Card><Statistic title="Tổng đơn hàng" value={kpi.totalOrders ?? 0} prefix="🧾" /></Card></Col>
          <Col xs={24} sm={12} lg={8}><Card><Statistic title="Doanh thu" value={kpi.totalRevenue ?? 0} suffix="đ" groupSeparator="." /></Card></Col>
        </Row>
      </Spin>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={16}>
          <Card title="Doanh thu 30 ngày">
            <QueryState loading={revenueQ.loading} error={revenueQ.error} empty={!revenue.length}>
              <div style={{ height: 300, marginTop: 10 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenue} margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0F766E" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#0F766E" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="_id" tick={{ fontSize: 12 }} tickFormatter={(val) => val.substring(5)} tickLine={false} axisLine={false} />
                    <YAxis tickFormatter={(val) => val >= 1000000 ? `${(val / 1000000).toFixed(0)}tr` : val} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <RechartsTooltip formatter={(value) => [formatCurrency(value), 'Doanh thu']} labelFormatter={(label) => `Ngày: ${label}`} />
                    <Area type="monotone" dataKey="revenue" stroke="#0F766E" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </QueryState>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Nguồn Lead">
            <QueryState loading={sourcesQ.loading} error={sourcesQ.error} empty={!sources.length}>
              <List
                dataSource={sources}
                renderItem={(s) => (
                  <List.Item>
                    <span>{s._id || 'Không rõ'}</span>
                    <Tag color="cyan">{s.count}</Tag>
                  </List.Item>
                )}
              />
            </QueryState>
          </Card>
        </Col>
      </Row>
    </>
  )
}

// ---- Leads ----------------------------------------------------------------
