import { useEffect } from 'react'
import { Card, List, Typography, Button, Badge } from 'antd'
import { useNotificationStore } from '../../stores/notificationStore'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { useNavigate } from 'react-router-dom'

dayjs.extend(relativeTime)

const { Title, Text } = Typography

export function AdminNotifications() {
  const { notifications, fetchNotifications, markAsRead, loading } = useNotificationStore()
  const navigate = useNavigate()

  useEffect(() => {
    fetchNotifications()
  }, [])

  const handleNotifClick = (notif) => {
    if (!notif.isRead) markAsRead(notif._id)
    if (notif.link) navigate(notif.link)
  }

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={3} className="admin-page-title">Tất cả thông báo</Title>
        <Button onClick={() => markAsRead('all')}>Đánh dấu tất cả đã đọc</Button>
      </div>

      <Card bodyStyle={{ padding: 0 }} bordered={false} style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
        <List
          loading={loading}
          dataSource={notifications}
          renderItem={(item) => (
            <List.Item
              style={{
                padding: '16px 24px',
                cursor: 'pointer',
                background: item.isRead ? '#fff' : '#f0fdfa',
                borderBottom: '1px solid #f0f0f0',
                transition: 'background 0.2s',
              }}
              onClick={() => handleNotifClick(item)}
            >
              <List.Item.Meta
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {!item.isRead && <Badge status="processing" />}
                    <span style={{ fontWeight: item.isRead ? 400 : 600, color: '#1e293b', fontSize: 15 }}>{item.title}</span>
                  </div>
                }
                description={
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4, marginLeft: item.isRead ? 0 : 14 }}>
                    <Text style={{ color: '#475569', fontSize: 14 }}>{item.message}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>{dayjs(item.createdAt).fromNow()}</Text>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  )
}
