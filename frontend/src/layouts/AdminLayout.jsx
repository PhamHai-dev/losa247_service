import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Dropdown } from 'antd'
import { useAuthStore } from '../stores/authStore'

const menu = [
  ['/admin/dashboard', '📊 Dashboard'],
  ['/admin/leads', '⚡ Lead'],
  ['/admin/orders', '🧾 Đơn hàng'],
  ['/admin/blogs', '📝 Bài viết'],
  ['/admin/faqs', '❓ Hỏi đáp'],
  ['/admin/services', '🛍️ Dịch vụ & Gian hàng'],
  ['/admin/chat', '💬 Chat'],
  ['/admin/logs', '📜 Nhật ký'],
  ['/admin/users', '👥 Người dùng'],
  ['/admin/settings', '⚙️ Cấu hình'],
]

// Layout admin: sidebar cố định và topbar tìm kiếm/notification.
export function AdminLayout() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const handleLogout = async () => {
    await logout()
    navigate('/dang-nhap')
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">LOSA<span style={{ color: 'var(--orange)' }}>247</span> Admin</div>
        <nav className="admin-menu">
          {menu.map(([to, label]) => <NavLink key={to} to={to}>{label}</NavLink>)}
        </nav>
      </aside>
      <main className="admin-main">
        <div className="admin-topbar">
          <span />
          <Dropdown
            menu={{ items: [{ key: 'logout', label: 'Đăng xuất', onClick: handleLogout }] }}
            trigger={['click']}
          >
            <div style={{ cursor: 'pointer' }}>🔔 {user?.name || 'Admin Losa'} ▾</div>
          </Dropdown>
        </div>
        <div className="admin-content"><Outlet /></div>
      </main>
    </div>
  )
}
