import { Navigate, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Dropdown, Avatar } from 'antd'
import { 
  HomeOutlined, ThunderboltOutlined, ShoppingCartOutlined, 
  FileTextOutlined, QuestionCircleOutlined, ShopOutlined,
  MessageOutlined, TeamOutlined, HistoryOutlined, SettingOutlined,
  MenuOutlined, BellOutlined
} from '@ant-design/icons'
import { useAuthStore } from '../stores/authStore'
import { useState, useEffect } from 'react'

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
          {item.icon} {item.label}
        </span>
        <span style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s', fontSize: 10 }}>▼</span>
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
                  onMouseOver={(e) => { if (!isChildActive) { e.target.style.color = '#fff'; e.target.style.background = 'rgba(255,255,255,0.05)' }}}
                  onMouseOut={(e) => { if (!isChildActive) { e.target.style.color = '#94a3b8'; e.target.style.background = 'transparent' }}}
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
              {group.items.map((item) => {
                if (Array.isArray(item)) {
                  const [to, label, icon] = item
                  return (
                    <NavLink key={to} to={to}>
                      {icon} {label}
                    </NavLink>
                  )
                }
                return <SubMenuItem key={item.label} item={item} />
              })}
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
