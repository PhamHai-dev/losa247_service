import { useState } from 'react'
import {
  Alert, Button, Card, Col, Empty, List, Row, Segmented, Space, Spin, Statistic, Table, Tag, Typography
} from 'antd'
import {
  ReloadOutlined
} from '@ant-design/icons'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts'
import { useApiQuery } from '../../hooks/useApiQuery'
import { formatDate } from '../../utils/format'
import { dashboardService } from '../../features/dashboard/dashboardService'
import { LEAD_STATUS } from '../../constants/statusConfig'

const { Title, Text } = Typography

// ---- Reusable bits --------------------------------------------------------
function PageHeader({ title, extra }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, gap: 16, flexWrap: 'wrap' }}>
      <div>
        <Title level={3} style={{ margin: 0 }}>{title}</Title>
      </div>
      <Space wrap>{extra}</Space>
    </div>
  )
}

function StatusTag({ map, value }) {
  const cfg = map?.[value] || { label: value || '—', color: 'default' }
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
const COLORS = ['#0F766E', '#F59E0B', '#3B82F6', '#EF4444', '#8B5CF6', '#10B981']

export function AdminDashboard() {
  const [range, setRange] = useState('30d')

  const kpisQ = useApiQuery(() => dashboardService.getKpis(), [])
  const leadsChartQ = useApiQuery(() => dashboardService.getLeadsChart(range), [range])
  const statusQ = useApiQuery(() => dashboardService.getLeadStatus(), [])
  const recentLeadsQ = useApiQuery(() => dashboardService.getRecentLeads(), [])
  const popularContentQ = useApiQuery(() => dashboardService.getPopularContent(), [])

  const kpi = kpisQ.data?.data || {}
  const chartData = leadsChartQ.data?.data || []
  const statusData = statusQ.data?.data || []
  const recentLeads = recentLeadsQ.data?.data || []
  const popularContent = popularContentQ.data?.data || []

  const handleRefresh = () => {
    kpisQ.refetch()
    leadsChartQ.refetch()
    statusQ.refetch()
    recentLeadsQ.refetch()
    popularContentQ.refetch()
  }

  return (
    <>
      <PageHeader
        title="Dashboard tổng quan"
        extra={<Button icon={<ReloadOutlined />} onClick={handleRefresh}>Làm mới</Button>}
      />
      <Spin spinning={kpisQ.loading}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}><Card><Statistic title="Lead mới tháng này" value={kpi.newLeads ?? 0} prefix="⚡" valueStyle={{ color: '#0F766E' }}/></Card></Col>
          <Col xs={24} sm={12} lg={6}><Card><Statistic title="Dịch vụ hiện có" value={kpi.totalServices ?? 0} prefix="🛠️" /></Card></Col>
          <Col xs={24} sm={12} lg={6}><Card><Statistic title="Bài viết xuất bản" value={kpi.totalBlogs ?? 0} prefix="📝" /></Card></Col>
          <Col xs={24} sm={12} lg={6}><Card><Statistic title="Chờ xử lý (Lead/Chat)" value={kpi.pendingTasks ?? 0} prefix="💬" valueStyle={{ color: '#EF4444' }} /></Card></Col>
        </Row>
      </Spin>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={16}>
          <Card 
            title="Tăng trưởng Lead" 
            extra={
              <Segmented 
                options={[
                  { label: '7 Ngày', value: '7d' },
                  { label: '30 Ngày', value: '30d' },
                  { label: 'Năm nay', value: '1y' }
                ]} 
                value={range}
                onChange={setRange}
              />
            }
          >
            <QueryState loading={leadsChartQ.loading} error={leadsChartQ.error} empty={!chartData.length}>
              <div style={{ height: 300, marginTop: 10 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0F766E" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#0F766E" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="_id" tick={{ fontSize: 12 }} tickFormatter={(val) => range === '1y' ? val : val.substring(5)} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} allowDecimals={false} />
                    <RechartsTooltip formatter={(value) => [value, 'Lead mới']} labelFormatter={(label) => `Thời gian: ${label}`} />
                    <Area type="monotone" dataKey="leads" stroke="#0F766E" strokeWidth={3} fillOpacity={1} fill="url(#colorLeads)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </QueryState>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Trạng thái Lead">
            <QueryState loading={statusQ.loading} error={statusQ.error} empty={!statusData.length}>
              <div style={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="count"
                      nameKey="_id"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value, name) => [value, LEAD_STATUS[name]?.label || name]} />
                    <Legend formatter={(value) => LEAD_STATUS[value]?.label || value} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </QueryState>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="Yêu cầu tư vấn mới nhất (Leads)">
             <QueryState loading={recentLeadsQ.loading} error={recentLeadsQ.error} empty={!recentLeads.length}>
                <Table
                  dataSource={recentLeads}
                  rowKey="_id"
                  pagination={false}
                  size="small"
                  columns={[
                    { title: 'Khách hàng', dataIndex: 'name', key: 'name', render: (text, record) => <><Text strong>{text}</Text><br/><Text type="secondary" style={{fontSize: 12}}>{record.phone}</Text></> },
                    { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: (val) => <StatusTag map={LEAD_STATUS} value={val} /> },
                    { title: 'Thời gian', dataIndex: 'createdAt', key: 'createdAt', render: (val) => <Text type="secondary" style={{fontSize: 12}}>{formatDate(val)}</Text> },
                  ]}
                />
             </QueryState>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Bài viết được quan tâm nhất">
             <QueryState loading={popularContentQ.loading} error={popularContentQ.error} empty={!popularContent.length}>
                <List
                  dataSource={popularContent}
                  renderItem={(item, index) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Tag color={index < 3 ? "volcano" : "default"}>#{index + 1}</Tag>}
                        title={<a href={`/admin/blogs/edit/${item._id}`} target="_blank" rel="noreferrer">{item.title}</a>}
                        description={<Text type="secondary" style={{fontSize: 12}}>{formatDate(item.createdAt)}</Text>}
                      />
                      <Space>
                        <Tag icon={<span role="img" aria-label="eye">👁️</span>} color="blue">{item.views || 0} views</Tag>
                      </Space>
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
