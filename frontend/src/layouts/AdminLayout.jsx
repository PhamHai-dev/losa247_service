import { Navigate, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Dropdown, Avatar, Badge, Popover, List, Typography, Button } from 'antd'
import {
  HomeOutlined, ThunderboltOutlined, ShoppingCartOutlined,
  FileTextOutlined, QuestionCircleOutlined, ShopOutlined,
  MessageOutlined, TeamOutlined, HistoryOutlined, SettingOutlined,
  BellOutlined, DoubleLeftOutlined, RightOutlined, CloseOutlined
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

function SubMenuItem({ item, onNavigate }) {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const isActive = item.children.some(([to]) => location.pathname.startsWith(to))

  useEffect(() => {
    if (isActive) setOpen(true)
  }, [isActive])

  return (
    <div className={`admin-submenu ${isActive ? 'active' : ''} ${open ? 'open' : ''}`}>
      <button
        type="button"
        className="admin-submenu-title"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className="admin-menu-item-main">
          <span className="admin-menu-icon">{item.icon}</span>
          <span className="menu-label">{item.label}</span>
        </span>
        <span className="submenu-arrow" aria-hidden="true">⌄</span>
      </button>
      <div className="admin-submenu-panel">
        <div className="admin-submenu-panel-inner">
          {item.children.map(([to, label]) => (
            <NavLink key={to} to={to} onClick={onNavigate}>
              <span className="submenu-dot" />
              <span>{label}</span>
            </NavLink>
          ))}
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
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
    <div className={`admin-shell ${collapsed ? 'collapsed' : ''} ${mobileMenuOpen ? 'mobile-menu-open' : ''}`}>
      <button
        type="button"
        className="admin-sidebar-overlay"
        aria-label="Đóng menu quản trị"
        onClick={() => setMobileMenuOpen(false)}
      />
      <aside className="admin-sidebar">
        <div className="admin-sidebar-glow" aria-hidden="true" />
        <div className="admin-brand">
          <div className="admin-brand-mark" aria-hidden="true"><span>L</span></div>
          <div className="admin-brand-copy">
            <span className="brand-text">Losa247</span>
            <span className="brand-subtitle">Control Center</span>
          </div>
          <button
            type="button"
            className="collapse-btn"
            onClick={() => setCollapsed(true)}
            aria-label="Thu gọn sidebar"
          >
            <DoubleLeftOutlined />
          </button>
          <button
            type="button"
            className="mobile-close-btn"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Đóng sidebar"
          >
            <CloseOutlined />
          </button>
        </div>
        <nav className="admin-menu" aria-label="Điều hướng quản trị">
          {menuGroups.map((group) => (
            <div className="admin-menu-group" key={group.title}>
              <div className="sidebar-group-title"><span>{group.title}</span></div>
              {group.items.map((item) => {
                if (Array.isArray(item)) {
                  const [to, label, icon] = item
                  return (
                    <NavLink key={to} to={to} onClick={() => setMobileMenuOpen(false)}>
                      <span className="admin-menu-icon">{icon}</span>
                      <span className="menu-label">{label}</span>
                    </NavLink>
                  )
                }
                return <SubMenuItem key={item.label} item={item} onNavigate={() => setMobileMenuOpen(false)} />
              })}
            </div>
          ))}
        </nav>
        <div className="admin-sidebar-status">
          <span className="status-pulse" />
          <div><strong>Hệ thống ổn định</strong><span>Tất cả dịch vụ hoạt động</span></div>
        </div>
      </aside>
      <main className="admin-main">
        <div className="admin-topbar" style={{ justifyContent: collapsed ? 'space-between' : 'flex-end' }}>
          {collapsed && (
            <button type="button" className="header-collapse-btn" onClick={() => setCollapsed(false)} aria-label="Mở sidebar">
              <RightOutlined />
            </button>
          )}
          <button type="button" className="mobile-menu-btn" onClick={() => setMobileMenuOpen(true)} aria-label="Mở menu quản trị">
            <span /><span /><span />
          </button>
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
