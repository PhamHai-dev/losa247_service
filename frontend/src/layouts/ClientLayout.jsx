import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import EmojiPicker from 'emoji-picker-react'
import { MessageCircle, Volume2, MoreVertical, X, Check, CheckCheck, Smile, Image as ImageIcon, Paperclip, Send, Bot, ChevronDown, BarChart2, Rocket, User, ArrowRight, Layers, MessageSquare, Magnet, Headphones, Phone, Mail, MapPin, Menu as MenuIcon, CheckCircle, Shield, Briefcase, Grid } from 'lucide-react'
import { Drawer, message } from 'antd'
import { useAuthStore } from '../stores/authStore'
import { useUIStore } from '../stores/uiStore'
import { clientChatService } from '../features/chat/chatService'
import { useChatSocket } from '../features/chat/useChatSocket'
import { useApiQuery } from '../hooks/useApiQuery'
import { settingsService } from '../features/settings/settingsService'
import { leadsService } from '../features/leads/leadsService'
import LeadFormModal from '../components/common/LeadFormModal'

// Widget chat nổi dùng chung toàn site (tạo session client + socket realtime).
function ChatWidget({ user }) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [attachments, setAttachments] = useState([])
  const [uploading, setUploading] = useState(false)

  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)
  const imageInputRef = useRef(null)
  const emojiPickerRef = useRef(null)

  const { sendMessage, joinSession } = useChatSocket(sessionId, {
    role: 'customer',
    onMessage: (msg) => setMessages((prev) => [...prev, msg]),
  })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Close emoji picker when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [emojiPickerRef]);

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
    if (!user) {
      message.info('Vui lòng đăng nhập để bắt đầu trò chuyện!')
      navigate('/dang-nhap')
      return
    }
    const next = !open
    setOpen(next)
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const data = await clientChatService.uploadAttachment(formData)
      if (data?.url) {
        setAttachments(prev => [...prev, data.url])
      }
    } catch (err) {
      console.error('Lỗi tải file:', err)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const send = async () => {
    if (!text.trim() && !attachments.length) return
    let id = sessionId
    if (!id) {
      id = await ensureSession()
      if (id) joinSession(id)
    }
    if (!id) return
    sendMessage(text, attachments, id)
    setText('')
    setAttachments([])
    setShowEmojiPicker(false)
  }

  const onEmojiClick = (emojiObject) => {
    setText(prev => prev + emojiObject.emoji)
  }

  return (
    <div className="chat-widget">
      <button className="btn btn-primary chat-button" onClick={toggle} style={{ padding: 0 }}>
        <MessageCircle size={32} />
      </button>
      {open && (
        <div className="card chat-panel" style={{ padding: 0, overflow: 'hidden' }}>
          {/* Header */}
          <div className="chat-header">
            <div className="chat-header-info">
              <div className="chat-avatar">
                <Bot size={24} color="#000" />
              </div>
              <div className="chat-title">
                <b>Admin <Check size={14} color="#fff" style={{ background: '#3B82F6', borderRadius: '50%', padding: 2, display: 'inline-block', verticalAlign: 'middle', marginLeft: 4 }} /></b>
                <p className="badge active">Đang hoạt động</p>
              </div>
            </div>
            <div className="chat-header-actions">
              <Volume2 size={20} color="#64748B" />
              <MoreVertical size={20} color="#64748B" />
              <X size={20} color="#64748B" onClick={() => setOpen(false)} style={{ cursor: 'pointer' }} />
            </div>
          </div>

          {/* Body */}
          <div className="chat-body" style={{ height: 350, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {!messages.length && (
              <div className="chat-message-row">
                <div className="chat-bot-avatar"><Bot size={16} color="#3B82F6" /></div>
                <div className="bubble">
                  Hello
                  <div className="chat-time">Vừa xong</div>
                </div>
              </div>
            )}
            {messages.map((m) => (
              m.sender === 'customer' ? (
                <div key={m._id} className="chat-message-row me">
                  <div className="bubble me">
                    {m.content && <div>{m.content}</div>}
                    {m.attachments?.map((url, i) => (
                      <img key={i} src={url} alt="attachment" style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8, marginTop: m.content ? 8 : 0, display: 'block' }} />
                    ))}
                  </div>
                </div>
              ) : (
                <div key={m._id} className="chat-message-row">
                  <div className="chat-bot-avatar"><Bot size={16} color="#3B82F6" /></div>
                  <div className="bubble">
                    {m.content && <div>{m.content}</div>}
                    {m.attachments?.map((url, i) => (
                      <img key={i} src={url} alt="attachment" style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8, marginTop: m.content ? 8 : 0, display: 'block' }} />
                    ))}
                    <div className="chat-time">Vừa xong</div>
                  </div>
                </div>
              )
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="chat-input-area" style={{ position: 'relative' }}>
            {showEmojiPicker && (
              <div ref={emojiPickerRef} style={{ position: 'absolute', bottom: '100%', right: 16, zIndex: 10 }}>
                <EmojiPicker onEmojiClick={onEmojiClick} height={350} width={300} />
              </div>
            )}

            {attachments.length > 0 && (
              <div style={{ display: 'flex', gap: 8, marginBottom: 8, overflowX: 'auto', paddingBottom: 4 }}>
                {attachments.map((url, i) => (
                  <div key={i} style={{ position: 'relative', flexShrink: 0 }}>
                    <img src={url} alt="preview" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8 }} />
                    <button
                      style={{ position: 'absolute', top: -5, right: -5, background: 'red', color: 'white', borderRadius: '50%', width: 20, height: 20, border: 'none', cursor: 'pointer', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {uploading && <div style={{ fontSize: 12, color: '#3B82F6', marginBottom: 8, paddingLeft: 12 }}>Đang tải file lên...</div>}

            <div className="chat-input-wrapper">
              <input placeholder="Nhập tin nhắn..." value={text} onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') send() }} />
              <div className="chat-input-actions">
                <Smile size={20} color="#3B82F6" style={{ cursor: 'pointer' }} onClick={() => setShowEmojiPicker(!showEmojiPicker)} />
                <ImageIcon size={20} color="#3B82F6" style={{ cursor: 'pointer' }} onClick={() => imageInputRef.current?.click()} />
                <Paperclip size={20} color="#3B82F6" style={{ cursor: 'pointer' }} onClick={() => fileInputRef.current?.click()} />
                <button className="chat-send-btn" onClick={send} disabled={uploading}>
                  <Send size={16} color="#fff" />
                </button>
                <input type="file" hidden ref={imageInputRef} accept="image/*" onChange={handleFileUpload} />
                <input type="file" hidden ref={fileInputRef} onChange={handleFileUpload} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const BrandText = ({ siteName }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start' }}>
      <div style={{ fontSize: '26px', fontWeight: 900, lineHeight: 1, letterSpacing: '-0.5px', fontFamily: '"Inter", "Montserrat", sans-serif' }}>
        <span style={{ color: '#0B192C' }}>Losa</span><span style={{ color: '#22c55e' }}>247</span>
      </div>
      <div style={{ fontSize: '9px', fontWeight: 700, color: '#475569', letterSpacing: '0.8px', marginTop: '4px', whiteSpace: 'nowrap', textTransform: 'uppercase' }}>
        Tự động hóa chăm sóc 24/7
      </div>
    </div>
  )
}

// Layout client: header sticky, footer và chat widget dùng chung toàn site.
export function ClientLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { authType, user, logout } = useAuthStore()
  const siteQuery = useApiQuery(() => settingsService.getPublicSiteInfo(), [])

  const { openLeadModal } = useUIStore()
  const [forceCloseDropdown, setForceCloseDropdown] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileSolutionsOpen, setMobileSolutionsOpen] = useState(false)
  const [mobilePricingOpen, setMobilePricingOpen] = useState(false)

  // CTA form state
  const [ctaName, setCtaName] = useState('')
  const [ctaEmail, setCtaEmail] = useState('')
  const [ctaPhone, setCtaPhone] = useState('')
  const [ctaSubmitting, setCtaSubmitting] = useState(false)

  const handleCtaSubmit = async () => {
    if (!ctaName || !ctaPhone) {
      message.error('Vui lòng nhập Họ tên và Số điện thoại!')
      return
    }
    setCtaSubmitting(true)
    try {
      await leadsService.createPublicLead({
        name: ctaName,
        email: ctaEmail,
        phone: ctaPhone,
        source: 'footer_cta'
      })
      message.success('Đăng ký thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.')
      setCtaName('')
      setCtaEmail('')
      setCtaPhone('')
    } catch (e) {
      message.error(e?.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại!')
    } finally {
      setCtaSubmitting(false)
    }
  }

  const isSolutionsActive = location.pathname.startsWith('/giai-phap')
  const isPricingActive = location.pathname.startsWith('/bang-gia')

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const siteInfo = siteQuery.data || {}
  // Default values to fallback gracefully
  const siteName = siteInfo.name || 'LOSA247'
  const logoUrl = siteInfo.logoUrl || 'https://amqkxxpqkoagqqephtgl.supabase.co/storage/v1/object/sign/web_losa/logo_web.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82M2FmMGExMS0yYjgxLTQ5YzYtODgyYy04ZTY0ZGU5NTE3OGMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ3ZWJfbG9zYS9sb2dvX3dlYi5wbmciLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzg1MjM5MzkzLCJleHAiOjE4MTY3NzUzOTN9.itlV_P4NE_0_9O-oEA7Us2xIsEqwr8pyIGa92fgIUCs'
  const slogan = siteInfo.slogan || 'AI Sales'
  const hotline = siteInfo.hotline || '0901 247 247'
  const email = siteInfo.email || 'hotline@losa247.vn'

  return (
    <div className="client-app-wrapper">
      <header className="client-header">
        <nav className="client-nav container">
          <Link className="logo" to="/" style={{ display: 'flex', alignItems: 'center', gap: 0, textDecoration: 'none' }}>
            <img src={logoUrl} alt="Logo" style={{ height: 80, objectFit: 'contain' }} />
            <BrandText siteName={siteName} />
          </Link>
          <div className="menu">
            <NavLink to="/">Trang chủ</NavLink>
            <NavLink to="/blog">Blog</NavLink>

            <div className="dropdown-container" onMouseEnter={() => setForceCloseDropdown(false)}>
              <a href="#" className={`dropdown-trigger ${isSolutionsActive ? 'active' : ''}`} onClick={(e) => e.preventDefault()} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                Giải pháp <ChevronDown size={14} />
              </a>
              <div className="dropdown-menu" style={{ display: forceCloseDropdown ? 'none' : '' }} onClick={() => setForceCloseDropdown(true)}>
                <NavLink to="/giai-phap/chatbot" className="dropdown-item">
                  <div className="dropdown-icon" style={{ backgroundColor: '#ecfdf5', color: '#10b981' }}><Bot size={20} /></div>
                  <div className="dropdown-text">
                    <h4>Chatbot AI</h4>
                    <p>Tự động hóa hội thoại, chăm sóc khách hàng 24/7</p>
                  </div>
                </NavLink>
                <div className="dropdown-divider"></div>
                <NavLink to="/giai-phap/crm" className="dropdown-item">
                  <div className="dropdown-icon" style={{ backgroundColor: '#eff6ff', color: '#3b82f6' }}><BarChart2 size={20} /></div>
                  <div className="dropdown-text">
                    <h4>CRM</h4>
                    <p>Quản lý khách hàng tập trung, tăng hiệu quả bán hàng</p>
                  </div>
                </NavLink>
                <div className="dropdown-divider"></div>
                <NavLink to="/giai-phap/marketing" className="dropdown-item">
                  <div className="dropdown-icon" style={{ backgroundColor: '#f0fdf4', color: '#22c55e' }}><Send size={20} /></div>
                  <div className="dropdown-text">
                    <h4>Marketing Automation</h4>
                    <p>Tối ưu chiến dịch, nuôi dưỡng khách hàng tự động</p>
                  </div>
                </NavLink>
              </div>
            </div>

            <div className="dropdown-container" onMouseEnter={() => setForceCloseDropdown(false)}>
              <a href="#" className={`dropdown-trigger ${isPricingActive ? 'active' : ''}`} onClick={(e) => e.preventDefault()} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                Bảng giá <ChevronDown size={14} />
              </a>
              <div className="dropdown-menu" style={{ display: forceCloseDropdown ? 'none' : '' }} onClick={() => setForceCloseDropdown(true)}>
                <NavLink to="/bang-gia" end className="dropdown-item">
                  <div className="dropdown-icon" style={{ backgroundColor: '#ecfdf5', color: '#10b981' }}><Bot size={20} /></div>
                  <div className="dropdown-text">
                    <h4>Bảng giá Chatbot</h4>
                    <p>Các gói giải pháp tự động hóa 24/7</p>
                  </div>
                </NavLink>
                <div className="dropdown-divider"></div>
                <NavLink to="/bang-gia/crm" className="dropdown-item">
                  <div className="dropdown-icon" style={{ backgroundColor: '#eff6ff', color: '#3b82f6' }}><BarChart2 size={20} /></div>
                  <div className="dropdown-text">
                    <h4>Bảng giá CRM</h4>
                    <p>Gói quản lý khách hàng toàn diện</p>
                  </div>
                </NavLink>
                <div className="dropdown-divider"></div>
                <NavLink to="/bang-gia/marketing" className="dropdown-item">
                  <div className="dropdown-icon" style={{ backgroundColor: '#f0fdf4', color: '#22c55e' }}><Send size={20} /></div>
                  <div className="dropdown-text">
                    <h4>Bảng giá Marketing</h4>
                    <p>Các gói chiến dịch tiếp thị tự động</p>
                  </div>
                </NavLink>
              </div>
            </div>

          </div>
          <div className="menu" style={{ gap: '16px' }}>
            {authType === 'client' ? (
              <>
                <NavLink to="/tai-khoan" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><User size={18} /> {user?.name || 'Tài khoản'}</NavLink>
                <a onClick={handleLogout} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>Đăng xuất</a>
              </>
            ) : (
              <NavLink to="/dang-nhap" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: '#374151' }}>
                <User size={18} /> Đăng nhập
              </NavLink>
            )}
            <a className="btn btn-primary" onClick={openLeadModal} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px', borderRadius: '8px', boxShadow: 'none' }}>
              <Rocket size={16} /> Đăng ký trải nghiệm
            </a>
          </div>
          <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(true)}>
            <MenuIcon size={28} />
          </button>
        </nav>
      </header>

      <div style={{ flex: 1 }}>
        <Outlet />
      </div>

      <section className="client-cta-section">
        <div className="container">
          <div className="cta-grid">
            <div className="cta-content">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                <img src={logoUrl} alt="Logo" style={{ height: 48, objectFit: 'contain' }} />
                <BrandText siteName={siteName} theme="dark" />
              </div>
              <h2 className="cta-title">Khám phá cách doanh nghiệp của bạn kết nối với khách hàng <span style={{ color: '#22c55e' }}>24/7</span> cùng Losa</h2>
              <ul className="cta-benefits">
                <li><CheckCircle size={20} color="#22c55e" /> Tự động hóa quy trình nhắn tin với khách hàng</li>
                <li><CheckCircle size={20} color="#22c55e" /> Tiếp cận hàng nghìn khách qua chiến dịch gửi tin nhắn hàng loạt</li>
                <li><CheckCircle size={20} color="#22c55e" /> Kết hợp sức mạnh AI vào dịch vụ khách hàng một cách liền mạch</li>
              </ul>
            </div>
            <div className="cta-form-card">
              <div className="form-row">
                <div className="form-group">
                  <label>Họ và tên</label>
                  <div className="input-wrapper">
                    <User size={16} className="input-icon" />
                    <input type="text" placeholder="Nhập họ và tên" value={ctaName} onChange={(e) => setCtaName(e.target.value)} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Email doanh nghiệp</label>
                  <div className="input-wrapper">
                    <Mail size={16} className="input-icon" />
                    <input type="email" placeholder="Nhập email doanh nghiệp" value={ctaEmail} onChange={(e) => setCtaEmail(e.target.value)} />
                  </div>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Số điện thoại <span>*</span></label>
                  <div className="input-wrapper phone-input">
                    <div className="phone-prefix">
                      <Phone size={16} className="input-icon" />
                      <span>+84</span>
                      <ChevronDown size={14} style={{ marginLeft: 4 }} />
                    </div>
                    <input type="tel" placeholder="Nhập số điện thoại" value={ctaPhone} onChange={(e) => setCtaPhone(e.target.value)} />
                  </div>
                </div>
                <div style={{ flex: 1 }}></div>
              </div>
              <button className="btn btn-primary cta-submit-btn" onClick={handleCtaSubmit} disabled={ctaSubmitting}>
                {ctaSubmitting ? 'Đang gửi...' : <><span style={{ marginRight: 8 }}>Đặt lịch demo</span> <ArrowRight size={16} /></>}
              </button>
              <div className="cta-secure-note">
                <Shield size={14} color="#22c55e" /> Thông tin của bạn được bảo mật tuyệt đối
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="client-footer">
        <div className="container">
          <div className="footer-top-grid">
            {/* Column 1: Thương hiệu */}
            <div className="footer-col brand-col">
              <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 24, textDecoration: 'none' }}>
                <img src={logoUrl} alt="Logo" style={{ height: 60, objectFit: 'contain' }} />
                <BrandText siteName={siteName} theme="dark" />
              </Link>
              <p className="footer-desc">Giải pháp tự động hóa bán hàng & chăm sóc khách hàng thông minh qua Messenger.</p>
              <div className="footer-socials">
                <a href="#" className="social-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                </a>
                <a href="#" className="social-icon"><MessageCircle size={18} /></a>
                <a href="#" className="social-icon" style={{ fontWeight: 'bold', fontSize: 12, lineHeight: 1 }}>Zalo</a>
                <a href="#" className="social-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
                </a>
              </div>
            </div>

            {/* Column 2: SẢN PHẨM */}
            <div className="footer-col">
              <h3>SẢN PHẨM</h3>
              <ul>
                <li><Link to="#">Tính năng</Link></li>
                <li><Link to="#">Bảng giá</Link></li>
                <li><Link to="#">Demo</Link></li>
                <li><Link to="#">Giao diện</Link></li>
                <li><Link to="#">Cập nhật</Link></li>
              </ul>
            </div>

            {/* Column 3: DỊCH VỤ */}
            <div className="footer-col">
              <h3>DỊCH VỤ</h3>
              <ul>
                <li><Link to="#">Chatbot Messenger</Link></li>
                <li><Link to="#">Gửi tin nhắn hàng loạt</Link></li>
                <li><Link to="#">Tự động hóa quy trình</Link></li>
                <li><Link to="#">Tích hợp API</Link></li>
                <li><Link to="#">Tư vấn giải pháp</Link></li>
              </ul>
            </div>

            {/* Column 4: HỖ TRỢ */}
            <div className="footer-col">
              <h3>HỖ TRỢ</h3>
              <ul>
                <li><Link to="#">Trung tâm trợ giúp</Link></li>
                <li><Link to="#">Hướng dẫn sử dụng</Link></li>
                <li><Link to="#">Blog hướng dẫn</Link></li>
                <li><Link to="#">FAQ</Link></li>
                <li><Link to="#">Liên hệ hỗ trợ</Link></li>
              </ul>
            </div>

            {/* Column 5: LIÊN HỆ */}
            <div className="footer-col contact-col">
              <h3>LIÊN HỆ</h3>
              <ul>
                <li><Phone size={16} className="contact-icon" /> 1900 1234</li>
                <li><Mail size={16} className="contact-icon" /> contact@losa247.vn</li>
                <li style={{ alignItems: 'flex-start' }}><MapPin size={16} className="contact-icon" style={{ marginTop: 4 }} /> <span>123 Đường ABC, Quận 1,<br />TP. Hồ Chí Minh</span></li>
              </ul>
            </div>


          </div>

          <div className="footer-bottom">
            <div className="footer-copyright" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ background: '#0f172a', padding: '6px', borderRadius: '8px', display: 'flex' }}>
                <Shield size={16} color="#3b82f6" />
              </div>
              © 2024 Losa247. Tất cả quyền được bảo lưu.
            </div>
            <div className="footer-links">
              <Link to="#">Chính sách bảo mật</Link>
              <span className="separator">|</span>
              <Link to="#">Điều khoản sử dụng</Link>
              <span className="separator">|</span>
              <Link to="#">Chính sách hoàn tiền</Link>
            </div>
          </div>
        </div>
      </footer>

      <ChatWidget user={user} />
      <LeadFormModal />
      <Drawer
        title="Menu"
        placement="right"
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        className="mobile-nav-drawer"
        width={300}
      >
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <NavLink to="/" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Trang chủ</NavLink>
          <NavLink to="/blog" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Blog</NavLink>

          <div className="mobile-nav-submenu">
            <div className="mobile-nav-link" style={{ background: '#f8fafc', borderBottom: 'none', cursor: 'pointer' }} onClick={() => setMobileSolutionsOpen(!mobileSolutionsOpen)}>
              Giải pháp <ChevronDown size={16} style={{ transform: mobileSolutionsOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />
            </div>
            {mobileSolutionsOpen && (
              <div style={{ backgroundColor: '#fff' }}>
                <NavLink to="/giai-phap/chatbot" className="mobile-nav-sublink" onClick={() => setMobileMenuOpen(false)}><Bot size={16} /> Chatbot AI</NavLink>
                <NavLink to="/giai-phap/crm" className="mobile-nav-sublink" onClick={() => setMobileMenuOpen(false)}><BarChart2 size={16} /> CRM</NavLink>
                <NavLink to="/giai-phap/marketing" className="mobile-nav-sublink" onClick={() => setMobileMenuOpen(false)}><Send size={16} /> Marketing</NavLink>
              </div>
            )}
          </div>

          <div className="mobile-nav-submenu">
            <div className="mobile-nav-link" style={{ background: '#f8fafc', borderBottom: 'none', cursor: 'pointer' }} onClick={() => setMobilePricingOpen(!mobilePricingOpen)}>
              Bảng giá <ChevronDown size={16} style={{ transform: mobilePricingOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />
            </div>
            {mobilePricingOpen && (
              <div style={{ backgroundColor: '#fff' }}>
                <NavLink to="/bang-gia" end className="mobile-nav-sublink" onClick={() => setMobileMenuOpen(false)}><Bot size={16} /> Bảng giá Chatbot</NavLink>
                <NavLink to="/bang-gia/crm" className="mobile-nav-sublink" onClick={() => setMobileMenuOpen(false)}><BarChart2 size={16} /> Bảng giá CRM</NavLink>
                <NavLink to="/bang-gia/marketing" className="mobile-nav-sublink" onClick={() => setMobileMenuOpen(false)}><Send size={16} /> Bảng giá Marketing</NavLink>
              </div>
            )}
          </div>
        </div>

        <div style={{ padding: '24px', borderTop: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {authType === 'client' ? (
            <>
              <NavLink to="/tai-khoan" className="btn btn-outline" style={{ display: 'flex', justifyContent: 'center', width: '100%', gap: '8px' }} onClick={() => setMobileMenuOpen(false)}><User size={18} /> {user?.name || 'Tài khoản'}</NavLink>
              <button className="btn" style={{ background: '#f1f5f9', color: '#475569', width: '100%', border: 'none' }} onClick={() => { handleLogout(); setMobileMenuOpen(false); }}>Đăng xuất</button>
            </>
          ) : (
            <NavLink to="/dang-nhap" className="btn btn-outline" style={{ display: 'flex', justifyContent: 'center', width: '100%', gap: '8px' }} onClick={() => setMobileMenuOpen(false)}><User size={18} /> Đăng nhập</NavLink>
          )}
          <button className="btn btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px' }} onClick={() => { openLeadModal(); setMobileMenuOpen(false); }}><Rocket size={16} /> Đăng ký trải nghiệm</button>
        </div>
      </Drawer>
    </div>
  )
}
