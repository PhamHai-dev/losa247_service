import { Navigate, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Dropdown, Avatar } from 'antd'
import { 
  HomeOutlined, ThunderboltOutlined, ShoppingCartOutlined, 
  FileTextOutlined, QuestionCircleOutlined, ShopOutlined,
  MessageOutlined, TeamOutlined, HistoryOutlined, SettingOutlined,
  MenuOutlined, BellOutlined
} from '@ant-design/icons'
import { useAuthStore } from '../stores/authStore'

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
      ['/admin/services', 'Dịch vụ & Gian hàng', <ShopOutlined />],
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

export function AdminLayout() {
  const navigate = useNavigate()
  const { user, authType, logout } = useAuthStore()

  const handleLogout = async () => {
    await logout()
    navigate('/admin/dang-nhap')
  }

  if (authType !== 'admin') {
    return <Navigate to="/admin/dang-nhap" replace />
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          Losa247 Admin
        </div>
        <nav className="admin-menu">
          {menuGroups.map((group, idx) => (
            <div key={idx}>
              <div className="sidebar-group-title">{group.title}</div>
              {group.items.map(([to, label, icon]) => (
                <NavLink key={to} to={to}>
                  {icon} {label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        
        <Dropdown
          menu={{ items: [{ key: 'logout', label: 'Đăng xuất', onClick: handleLogout }] }}
          trigger={['click']}
          placement="topLeft"
        >
          <div className="admin-sidebar-footer">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Avatar style={{ backgroundColor: '#6366f1' }}>{user?.name?.[0]?.toUpperCase() || 'A'}</Avatar>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{user?.name || 'Super Admin'}</span>
                <span style={{ fontSize: 12, color: '#94a3b8' }}>{user?.email || 'admin@losa247.com'}</span>
              </div>
            </div>
            <span>▾</span>
          </div>
        </Dropdown>
      </aside>
      <main className="admin-main">
        <div className="admin-topbar">
          <MenuOutlined style={{ fontSize: 18, color: '#64748b', cursor: 'pointer' }} />
          <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            <BellOutlined style={{ fontSize: 18, color: '#64748b', cursor: 'pointer' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <Avatar size="small" style={{ backgroundColor: '#6366f1' }}>S</Avatar>
              <span style={{ fontSize: 14, color: '#475569', fontWeight: 500 }}>Super Admin</span>
            </div>
          </div>
        </div>
        <div className="admin-content"><Outlet /></div>
      </main>
    </div>
  )
}
