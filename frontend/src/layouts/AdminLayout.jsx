import { Navigate, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Dropdown, Avatar, Badge, Popover, List, Typography, Button } from 'antd'
import {
  HomeOutlined, ThunderboltOutlined, ShoppingCartOutlined,
  FileTextOutlined, QuestionCircleOutlined, ShopOutlined,
  MessageOutlined, TeamOutlined, HistoryOutlined, SettingOutlined,
  MenuOutlined, BellOutlined, DoubleLeftOutlined, RightOutlined
} from '@ant-design/icons'
import { useAuthStore } from '../stores/authStore'
import { useNotificationStore } from '../stores/notificationStore'
import { useState, useEffect } from 'react'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/vi'

dayjs.extend(relativeTime)
dayjs.locale('vi')

const { Text } = Typography

const menuGroups = [
  {
    title: 'TỔNG QUAN',
    items: [
      ['/admin/dashboard', 'Dashboard', <HomeOutlined />],
      ['/admin/leads', 'Lead', <ThunderboltOutlined />],
      ['/admin/orders', 'Đơn hàng', <ShoppingCartOutlined />],
    ]
  },
  {
    title: 'NỘI DUNG',
    items: [
      ['/admin/blogs', 'Bài viết', <FileTextOutlined />],
      ['/admin/faqs', 'Hỏi đáp', <QuestionCircleOutlined />],
      {
        label: 'Dịch vụ & Gian hàng',
        icon: <ShopOutlined />,
        children: [
          ['/admin/services', 'Gói dịch vụ'],
          ['/admin/store', 'Gian hàng']
        ]
      },
    ]
  },
  {
    title: 'KHÁCH HÀNG',
    items: [
      ['/admin/chat', 'Chat', <MessageOutlined />],
      ['/admin/users', 'Người dùng', <TeamOutlined />],
    ]
  },
  {
    title: 'HỆ THỐNG',
    items: [
      ['/admin/logs', 'Nhật ký', <HistoryOutlined />],
      ['/admin/settings', 'Cấu hình', <SettingOutlined />],
    ]
  }
]

function SubMenuItem({ item }) {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const isActive = item.children.some(([to]) => location.pathname.startsWith(to))

  useEffect(() => {
    if (isActive) setOpen(true)
  }, [isActive])

  return (
    <div className={`admin-submenu ${isActive ? 'active' : ''}`} style={{ marginBottom: 4 }}>
      <div
        className="admin-submenu-title"
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 16px', cursor: 'pointer', borderRadius: 8,
          color: isActive ? '#fff' : '#cbd5e1',
          background: isActive ? '#3b82f6' : 'transparent',
          transition: 'all 0.3s'
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 12, fontWeight: 500 }}>
          {item.icon} <span className="menu-label">{item.label}</span>
        </span>
        <span className="submenu-arrow" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s', fontSize: 10 }}>▼</span>
      </div>
      <div style={{
        display: 'grid',
        gridTemplateRows: open ? '1fr' : '0fr',
        transition: 'grid-template-rows 0.3s ease-in-out',
        opacity: open ? 1 : 0
      }}>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ paddingLeft: 34, paddingTop: 4, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {item.children.map(([to, label]) => {
              const isChildActive = location.pathname.startsWith(to);
              return (
                <NavLink
                  key={to}
                  to={to}
                  style={{
                    padding: '8px 12px', borderRadius: 8,
                    color: isChildActive ? '#fff' : '#94a3b8',
                    background: isChildActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                    textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8,
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => { if (!isChildActive) { e.target.style.color = '#fff'; e.target.style.background = 'rgba(255,255,255,0.05)' } }}
                  onMouseOut={(e) => { if (!isChildActive) { e.target.style.color = '#94a3b8'; e.target.style.background = 'transparent' } }}
                >
                  <span style={{ display: 'inline-block', width: 4, height: 4, borderRadius: '50%', background: 'currentColor' }} />
                  {label}
                </NavLink>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export function AdminLayout() {
  const navigate = useNavigate()
  const { user, authType, logout } = useAuthStore()
  const { notifications, unreadCount, fetchNotifications, markAsRead, initSocket, disconnectSocket } = useNotificationStore()
  const [collapsed, setCollapsed] = useState(false)
  const [notifVisible, setNotifVisible] = useState(false)

  useEffect(() => {
    if (authType === 'admin') {
      fetchNotifications()
      initSocket()
    }
    return () => disconnectSocket()
  }, [authType])

  const handleLogout = async () => {
    await logout()
    navigate('/admin/dang-nhap')
  }

  const handleNotifClick = (notif) => {
    setNotifVisible(false)
    if (!notif.isRead) markAsRead(notif._id)
    if (notif.link) navigate(notif.link)
  }

  const notifContent = (
    <div style={{ width: 320 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f0f0f0', paddingBottom: 8, marginBottom: 8 }}>
        <Text strong>Thông báo mới</Text>
        <Button type="link" size="small" onClick={() => markAsRead('all')} disabled={unreadCount === 0} style={{ padding: 0 }}>Đánh dấu đã đọc</Button>
      </div>
      <List
        dataSource={notifications.slice(0, 3)}
        locale={{ emptyText: 'Chưa có thông báo nào' }}
        renderItem={item => (
          <List.Item
            style={{ padding: '12px 8px', cursor: 'pointer', background: item.isRead ? 'transparent' : '#f0fdfa', borderRadius: 8, marginBottom: 4, border: 'none' }}
            onClick={() => handleNotifClick(item)}
          >
            <List.Item.Meta
              title={<span style={{ fontWeight: item.isRead ? 400 : 600, color: '#1e293b' }}>{item.title}</span>}
              description={
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <Text type="secondary" style={{ fontSize: 13, lineHeight: 1.4 }}>{item.message}</Text>
                  <Text type="secondary" style={{ fontSize: 11 }}>{dayjs(item.createdAt).fromNow()}</Text>
                </div>
              }
            />
          </List.Item>
        )}
      />
      <div style={{ textAlign: 'center', marginTop: 8, paddingTop: 8, borderTop: '1px solid #f0f0f0' }}>
        <Button type="link" block onClick={() => { setNotifVisible(false); navigate('/admin/notifications'); }} style={{ padding: 0 }}>Xem tất cả thông báo</Button>
      </div>
    </div>
  )

  if (authType !== 'admin') {
    return <Navigate to="/admin/dang-nhap" replace />
  }

  return (
    <div className={`admin-shell ${collapsed ? 'collapsed' : ''}`}>
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span className="brand-text">Losa247 Admin</span>
          <DoubleLeftOutlined
            className="collapse-btn"
            onClick={() => setCollapsed(!collapsed)}
          />
        </div>
        <nav className="admin-menu">
          {menuGroups.map((group, idx) => (
            <div key={idx}>
              <div className="sidebar-group-title">{group.title}</div>
              {group.items.map((item) => {
                if (Array.isArray(item)) {
                  const [to, label, icon] = item
                  return (
                    <NavLink key={to} to={to}>
                      {icon} <span className="menu-label">{label}</span>
                    </NavLink>
                  )
                }
                return <SubMenuItem key={item.label} item={item} />
              })}
            </div>
          ))}
        </nav>
      </aside>
      <main className="admin-main">
        <div className="admin-topbar" style={{ justifyContent: collapsed ? 'space-between' : 'flex-end' }}>
          {collapsed && (
            <div className="header-collapse-btn" onClick={() => setCollapsed(false)}>
              <RightOutlined />
            </div>
          )}
          <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            <Popover
              content={notifContent}
              trigger="click"
              placement="bottomRight"
              open={notifVisible}
              onOpenChange={setNotifVisible}
            >
              <Badge count={unreadCount} overflowCount={99} size="small" style={{ cursor: 'pointer' }}>
                <BellOutlined style={{ fontSize: 18, color: '#64748b', cursor: 'pointer' }} />
              </Badge>
            </Popover>
            <Dropdown
              menu={{ items: [{ key: 'logout', label: 'Đăng xuất', onClick: handleLogout }] }}
              trigger={['click']}
              placement="bottomRight"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <Avatar size="small" style={{ backgroundColor: '#6366f1' }}>{user?.name?.[0]?.toUpperCase() || 'A'}</Avatar>
                <span style={{ fontSize: 14, color: '#475569', fontWeight: 500 }}>{user?.name || 'Super Admin'}</span>
                <span style={{ fontSize: 10, color: '#64748b', marginLeft: 4 }}>▼</span>
              </div>
            </Dropdown>
          </div>
        </div>
        <div className="admin-content"><Outlet /></div>
      </main>
    </div>
  )
}
