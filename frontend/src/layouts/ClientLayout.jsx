import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuthStore } from '../stores/authStore'
import { clientChatService } from '../features/chat/chatService'
import { useChatSocket } from '../features/chat/useChatSocket'

// Widget chat nổi dùng chung toàn site (tạo session client + socket realtime).
function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')

  const { sendMessage } = useChatSocket(sessionId, {
    role: 'customer',
    onMessage: (msg) => setMessages((prev) => [...prev, msg]),
  })

  const ensureSession = async () => {
    if (sessionId) return sessionId
    try {
      const session = await clientChatService.createSession({})
      setSessionId(session._id)
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
    // Optimistic: hiển thị ngay tin của khách, bot_reply sẽ tới qua socket.
    setMessages((prev) => [...prev, { _id: `local-${prev.length}`, sender: 'customer', content: text }])
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

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <>
      <header className="client-header">
        <nav className="client-nav container">
          <Link className="logo" to="/">LOSA<span>247</span></Link>
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
            <NavLink className="btn btn-primary" to="/gio-hang">Giỏ hàng</NavLink>
          </div>
        </nav>
      </header>

      <Outlet />

      <footer className="client-footer">
        <div className="container grid footer-grid">
          <div><h2>LOSA247.VN</h2><p>AI Sales Agent giúp shop online tư vấn, chốt đơn và chăm sóc khách hàng 24/7.</p></div>
          <div><h3>Sản phẩm</h3><p>Dịch vụ AI</p><p>Gian hàng workflow</p></div>
          <div><h3>Hỗ trợ</h3><p>FAQ</p><p>Blog hướng dẫn</p></div>
          <div><h3>Liên hệ</h3><p>hotline@losa247.vn</p><p>0901 247 247</p></div>
        </div>
      </footer>

      <ChatWidget />
    </>
  )
}
