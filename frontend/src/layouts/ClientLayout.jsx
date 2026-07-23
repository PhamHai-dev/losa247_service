import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import { useAuthStore } from '../stores/authStore'
import { clientChatService } from '../features/chat/chatService'
import { useChatSocket } from '../features/chat/useChatSocket'
import { useApiQuery } from '../hooks/useApiQuery'
import { settingsService } from '../features/settings/settingsService'

// Widget chat nổi dùng chung toàn site (tạo session client + socket realtime).
function ChatWidget({ user }) {
  const [open, setOpen] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const messagesEndRef = useRef(null)

  const { sendMessage } = useChatSocket(sessionId, {
    role: 'customer',
    onMessage: (msg) => setMessages((prev) => [...prev, msg]),
  })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Khi user thay đổi (đăng nhập / đăng xuất), xoá session cũ đi
  // để lần mở chat tiếp theo sẽ tạo/tải lại session đúng với tài khoản.
  useEffect(() => {
    setSessionId(null)
    setMessages([])
    setOpen(false)
  }, [user])

  const ensureSession = async () => {
    if (sessionId) return sessionId
    try {
      const payload = {}
      if (user) {
        payload.customerName = user.name
        payload.customerPhone = user.phone
      }
      const session = await clientChatService.createSession(payload)
      setSessionId(session._id)
      
      // Lấy lịch sử chat
      const history = await clientChatService.getMessages(session._id)
      if (history && history.length > 0) {
        setMessages(history)
      }
      
      return session._id
    } catch {
      return null
    }
  }

  const toggle = async () => {
    const next = !open
    setOpen(next)
    if (next) await ensureSession()
  }

  const send = async () => {
    if (!text.trim()) return
    const id = await ensureSession()
    if (!id) return
    sendMessage(text)
    setText('')
  }

  return (
    <div className="chat-widget">
      <button className="btn btn-primary chat-button" onClick={toggle}>💬</button>
      {open && (
        <div className="card chat-panel">
          <b>Sales Agent Live</b>
          <p className="badge active">● Đang hoạt động</p>
          <div style={{ maxHeight: 220, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 6, margin: '8px 0' }}>
            {!messages.length && <div className="bubble">Xin chào! Bạn muốn tăng doanh số bằng AI?</div>}
            {messages.map((m) => (
              <div key={m._id} className={'bubble' + (m.sender === 'customer' ? ' me' : '')}>{m.content}</div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <input placeholder="Nhập tin nhắn..." value={text} onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') send() }} />
        </div>
      )}
    </div>
  )
}

// Layout client: header sticky, footer và chat widget dùng chung toàn site.
export function ClientLayout() {
  const navigate = useNavigate()
  const { authType, user, logout } = useAuthStore()
  const siteQuery = useApiQuery(() => settingsService.getPublicSiteInfo(), [])

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const siteInfo = siteQuery.data || {}
  // Default values to fallback gracefully
  const siteName = siteInfo.name || 'LOSA247'
  const logoUrl = siteInfo.logoUrl || 'https://res.cloudinary.com/e1d8bnbg/image/upload/v1784531182/logo_jtqgkt.png'
  const slogan = siteInfo.slogan || 'AI Sales Agent giúp shop online tư vấn, chốt đơn và chăm sóc khách hàng 24/7.'
  const hotline = siteInfo.hotline || '0901 247 247'
  const email = siteInfo.email || 'hotline@losa247.vn'

  return (
    <div className="client-app-wrapper">
      <header className="client-header">
        <nav className="client-nav container">
          <Link className="logo" to="/" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <img src={logoUrl} alt="Logo" style={{ height: 32 }} />
            <span>{siteName}</span>
          </Link>
          <div className="menu">
            <NavLink to="/">Trang chủ</NavLink>
            <NavLink to="/blog">Blog</NavLink>
            <NavLink to="/dich-vu">Dịch vụ</NavLink>
            <NavLink to="/gian-hang">Gian hàng</NavLink>
            <NavLink to="/hoi-dap">Hỏi đáp</NavLink>
          </div>
          <div className="menu">
            {authType === 'client' ? (
              <>
                <NavLink to="/tai-khoan">{user?.name || 'Tài khoản'}</NavLink>
                <a onClick={handleLogout} style={{ cursor: 'pointer' }}>Đăng xuất</a>
              </>
            ) : (
              <NavLink to="/dang-nhap">Đăng nhập</NavLink>
            )}
            <NavLink className="btn btn-primary" style={{ boxShadow: 'none' }} to="/gio-hang">Giỏ hàng</NavLink>
          </div>
        </nav>
      </header>

      <div style={{ flex: 1 }}>
        <Outlet />
      </div>

      <footer className="client-footer">
        <div className="container grid footer-grid">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <img src={logoUrl} alt="Logo" style={{ height: 32 }} />
              <h2>{siteName}</h2>
            </div>
            <p>{slogan}</p>
          </div>
          <div><h3>Sản phẩm</h3><p>Dịch vụ AI</p><p>Gian hàng workflow</p></div>
          <div><h3>Hỗ trợ</h3><p>FAQ</p><p>Blog hướng dẫn</p></div>
          <div><h3>Liên hệ</h3><p>{email}</p><p>{hotline}</p></div>
        </div>
      </footer>

      <ChatWidget user={user} />
    </div>
  )
}
