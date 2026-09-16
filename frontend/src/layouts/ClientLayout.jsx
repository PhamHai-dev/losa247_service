import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import EmojiPicker from 'emoji-picker-react'
import { MessageCircle, Volume2, MoreVertical, X, Check, CheckCheck, Smile, Image as ImageIcon, Paperclip, Send, Bot, ChevronDown, BarChart2, Rocket, User, ArrowRight, Layers, MessageSquare, Magnet, Headphones, Phone, Mail, MapPin, Menu as MenuIcon, CheckCircle, Shield, Briefcase, Grid, Zap, Plus } from 'lucide-react'
import { Drawer, Form, message } from 'antd'
import { useAuthStore } from '../stores/authStore'
import { useUIStore } from '../stores/uiStore'
import { clientChatService, API_BASE_URL } from '../features/chat/chatService'
import { useChatRealtime } from '../features/chat/useChatRealtime'
import { useApiQuery } from '../hooks/useApiQuery'
import { settingsService } from '../features/settings/settingsService'
import { leadsService } from '../features/leads/leadsService'
import LeadFormModal, { FooterDynamicLeadFields } from '../components/common/LeadFormModal'
import { useI18n } from '../hooks/useI18n'

function VietnamFlag({ className = '' }) {
  return (
    <svg className={className} width="28" height="20" viewBox="0 0 22 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="22" height="16" rx="2" fill="#F93939" />
      <path fillRule="evenodd" clipRule="evenodd" d="M11.0021 9.952L8.81257 11.1253L9.23162 8.6432L7.46114 6.8864L9.90838 6.52373L11.0021 4.26666L12.0969 6.52373L14.543 6.8864L12.7726 8.6432L13.1916 11.1243L11.0021 9.952Z" fill="#FFDA2C" />
    </svg>
  )
}

function UnitedStatesFlag({ className = '' }) {
  return (
    <svg className={className} width="28" height="20" viewBox="0 0 22 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <g clipPath="url(#us-flag-rounded-clip)">
        <rect width="22" height="16" rx="2" fill="white" />
        <path fillRule="evenodd" clipRule="evenodd" d="M0 0H9.42857V7.46667H0V0Z" fill="#1A47B8" />
        <path fillRule="evenodd" clipRule="evenodd" d="M9.42857 0V1.06667H22V0H9.42857ZM9.42857 2.13333V3.2H22V2.13333H9.42857ZM9.42857 4.26667V5.33333H22V4.26667H9.42857ZM9.42857 6.4V7.46667H22V6.4H9.42857ZM0 8.53333V9.6H22V8.53333H0ZM0 10.6667V11.7333H22V10.6667H0ZM0 12.8V13.8667H22V12.8H0ZM0 14.9333V16H22V14.9333H0Z" fill="#F93939" />
        <path fillRule="evenodd" clipRule="evenodd" d="M1.04762 1.06668V2.13335H2.09524V1.06668H1.04762ZM3.14286 1.06668V2.13335H4.19048V1.06668H3.14286ZM5.2381 1.06668V2.13335H6.28571V1.06668H5.2381ZM7.33333 1.06668V2.13335H8.38095V1.06668H7.33333ZM6.28571 2.13335V3.20001H7.33333V2.13335H6.28571ZM4.19048 2.13335V3.20001H5.2381V2.13335H4.19048ZM2.09524 2.13335V3.20001H3.14286V2.13335H2.09524ZM1.04762 3.20001V4.26668H2.09524V3.20001H1.04762ZM3.14286 3.20001V4.26668H4.19048V3.20001H3.14286ZM5.2381 3.20001V4.26668H6.28571V3.20001H5.2381ZM7.33333 3.20001V4.26668H8.38095V3.20001H7.33333ZM1.04762 5.33335V6.40001H2.09524V5.33335H1.04762ZM3.14286 5.33335V6.40001H4.19048V5.33335H3.14286ZM5.2381 5.33335V6.40001H6.28571V5.33335H5.2381ZM7.33333 5.33335V6.40001H8.38095V5.33335H7.33333ZM6.28571 4.26668V5.33335H7.33333V4.26668H6.28571ZM4.19048 4.26668V5.33335H5.2381V4.26668H4.19048ZM2.09524 4.26668V5.33335H3.14286V4.26668H2.09524Z" fill="white" />
      </g>
      <defs><clipPath id="us-flag-rounded-clip"><rect width="22" height="16" rx="2" fill="white" /></clipPath></defs>
    </svg>
  )
}

// Widget chat nổi dùng chung toàn site (tạo session client + socket realtime).
function ChatWidget({ user }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { locale, t, localizedPath } = useI18n()
  const [open, setOpen] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const [sessionToken, setSessionToken] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [attachments, setAttachments] = useState([])
  const [uploading, setUploading] = useState(false)

  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)
  const imageInputRef = useRef(null)
  const emojiPickerRef = useRef(null)

  const appendMessage = (incoming) => setMessages((prev) => {
    const id = incoming?._id || incoming?.id
    return id && prev.some((item) => (item._id || item.id) === id) ? prev : [...prev, incoming]
  })
  useChatRealtime({ sessionId, sessionToken, role: 'customer', onMessage: appendMessage })

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
    setSessionToken(null)
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
      const token = session.sessionToken || null
      setSessionToken(token)

      const history = await clientChatService.getMessages(session._id, token)
      if (history && history.length > 0) {
        setMessages(history)
      }

      return { id: session._id, token }
    } catch {
      return null
    }
  }

  const toggle = async () => {
    if (!user) {
      message.info(t('chat.loginRequired'))
      navigate(localizedPath('/dang-nhap'), { state: { returnTo: `${location.pathname}${location.search}${location.hash}` } })
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
      const credentials = sessionId ? { id: sessionId, token: sessionToken } : await ensureSession()
      if (!credentials?.id) throw new Error('Không thể tạo phiên chat')
      const formData = new FormData()
      formData.append('file', file)
      formData.append('sessionId', credentials.id)
      const data = await clientChatService.uploadAttachment(formData, credentials.token)
      if (data?.id && data?.url) setAttachments(prev => [...prev, data])
    } catch (err) {
      console.error('Lỗi tải file:', err)
      message.error(t('chat.uploadError'))
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const send = async () => {
    if (!text.trim() && !attachments.length) return
    const credentials = sessionId ? { id: sessionId, token: sessionToken } : await ensureSession()
    if (!credentials?.id) return
    try {
      const saved = await clientChatService.sendMessage(credentials.id, credentials.token, {
        clientMessageId: globalThis.crypto?.randomUUID?.() || `${Date.now()}`,
        content: text,
        attachmentIds: attachments.map((item) => item.id),
      })
      appendMessage(saved)
      setText('')
      setAttachments([])
      setShowEmojiPicker(false)
    } catch { message.error('Không thể gửi tin nhắn') }
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
                  <div className="chat-time">{locale === 'en' ? 'Just now' : 'Vừa xong'}</div>
                </div>
              </div>
            )}
            {messages.map((m) => (
              m.sender === 'customer' ? (
                <div key={m._id} className="chat-message-row me" style={{ flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  {m.content && (
                    <div className="bubble me">
                      <div>{m.content}</div>
                    </div>
                  )}
                  {m.attachments?.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                      {m.attachments.map((attachment, i) => (
                        <img key={attachment?.id || i} src={typeof attachment === 'string' ? attachment : (attachment.url || `${API_BASE_URL}/chat/attachments/${attachment.id}/content?token=${encodeURIComponent(sessionToken || '')}`)} alt="attachment" style={{ maxWidth: 200, maxHeight: 120, objectFit: 'cover', borderRadius: 8, display: 'block', border: '1px solid #e5e7eb' }} />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div key={m._id} className="chat-message-row">
                  <div className="chat-bot-avatar"><Bot size={16} color="#3B82F6" /></div>
                  <div className="bubble">
                    {m.content && <div>{m.content}</div>}
                    {m.attachments?.map((attachment, i) => (
                      <img key={attachment?.id || i} src={typeof attachment === 'string' ? attachment : (attachment.url || `${API_BASE_URL}/chat/attachments/${attachment.id}/content?token=${encodeURIComponent(sessionToken || '')}`)} alt="attachment" style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8, marginTop: m.content ? 8 : 0, display: 'block' }} />
                    ))}
                    <div className="chat-time">{locale === 'en' ? 'Just now' : 'Vừa xong'}</div>
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

            <div className="chat-input-wrapper" style={{ flexDirection: 'column', alignItems: 'flex-start', borderRadius: attachments.length > 0 ? 16 : 24, padding: attachments.length > 0 ? '12px 12px 8px 16px' : '8px 8px 8px 16px' }}>
              {attachments.length > 0 && (
                <div style={{ display: 'flex', gap: 8, marginBottom: 8, width: '100%', overflowX: 'auto', paddingBottom: 4 }}>
                  <div
                    onClick={() => imageInputRef.current?.click()}
                    style={{ width: 60, height: 60, borderRadius: 12, backgroundColor: '#D1D5DB', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                    <Plus size={24} color="#000" />
                  </div>
                  {attachments.map((attachment, i) => (
                    <div key={attachment.id || i} style={{ position: 'relative', flexShrink: 0 }}>
                      <img src={attachment.url} alt="preview" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 12 }} />
                      <button
                        style={{ position: 'absolute', top: -2, right: -6, background: '#fff', color: '#000', borderRadius: '50%', width: 22, height: 22, border: '1px solid #E5E7EB', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                        onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))}
                      >
                        <X size={14} strokeWidth={2.5} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {uploading && <div style={{ fontSize: 12, color: '#3B82F6', marginBottom: 8 }}>{t('chat.upload')}</div>}
              <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <input placeholder={t('chat.placeholder')} value={text} onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') send() }} style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none' }} />
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
        </div>
      )}
    </div>
  )
}

const BrandText = ({ siteName, slogan, theme = 'light' }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start' }}>
      <div style={{ fontSize: '26px', fontWeight: 900, lineHeight: 1, letterSpacing: '-0.5px', fontFamily: '"Inter", "Montserrat", sans-serif', color: theme === 'dark' ? '#fff' : '#0B192C' }}>
        {siteName}
      </div>
      <div style={{ fontSize: '9px', fontWeight: 700, color: theme === 'dark' ? '#cbd5e1' : '#475569', letterSpacing: '0.8px', marginTop: '4px', whiteSpace: 'nowrap', textTransform: 'uppercase' }}>
        {slogan}
      </div>
    </div>
  )
}

// Layout client: header sticky, footer và chat widget dùng chung toàn site.
export function ClientLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { authType, user, logout } = useAuthStore()
  const { locale, t, localizedPath, switchLocale } = useI18n()
  const siteQuery = useApiQuery(() => settingsService.getPublicSiteInfo(locale), [locale])
  const appearanceQuery = useApiQuery(() => settingsService.getPublicAppearance(locale), [locale])

  const { openLeadModal } = useUIStore()
  const [forceCloseDropdown, setForceCloseDropdown] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileSolutionsOpen, setMobileSolutionsOpen] = useState(false)
  const [mobilePricingOpen, setMobilePricingOpen] = useState(false)
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false)
  const languageMenuRef = useRef(null)

  // Footer dùng chung schema form động nhưng vẫn hiển thị trực tiếp.
  const [footerForm] = Form.useForm()
  const [ctaSubmitting, setCtaSubmitting] = useState(false)
  const leadFormQuery = useApiQuery(() => settingsService.getPublicLeadForm(locale), [locale])

  const handleCtaSubmit = async (values) => {
    setCtaSubmitting(true)
    try {
      await leadsService.createPublicLead({ formVersion: leadFormQuery.data?.version, values })
      message.success(t('forms.success'))
      footerForm.resetFields()
    } catch (error) {
      message.error(error?.error?.message || t('errors.generic'))
    } finally { setCtaSubmitting(false) }
  }

  const isSolutionsActive = location.pathname.startsWith('/giai-phap') || location.pathname.startsWith('/en/solutions')
  const isPricingActive = location.pathname.startsWith('/bang-gia') || location.pathname.startsWith('/en/pricing')
  const authNavigationState = { returnTo: `${location.pathname}${location.search}${location.hash}` }

  const handleLogout = async () => {
    await logout()
    navigate(localizedPath('/'))
  }

  const siteInfo = siteQuery.data || {}
  const siteName = siteInfo.name || 'LOSA247'
  const logoUrl = siteInfo.logoUrl || '/images/layouts/logo.png'
  const slogan = siteInfo.slogan || 'Tự động hóa chăm sóc 24/7'
  const hotline = siteInfo.hotline || '0901 247 247'
  const email = siteInfo.email || 'hotline@losa247.vn'
  const address = siteInfo.address || 'TP. Hồ Chí Minh'
  const facebookUrl = siteInfo.socialLinks?.facebook || '#'
  const zaloUrl = siteInfo.socialLinks?.zalo || '#'

  useEffect(() => {
    if (!siteQuery.data) return
    document.title = siteName
    if (siteInfo.faviconUrl) {
      let favicon = document.querySelector('link[rel="icon"]')
      if (!favicon) { favicon = document.createElement('link'); favicon.rel = 'icon'; document.head.appendChild(favicon) }
      favicon.href = siteInfo.faviconUrl
    }
  }, [siteQuery.data, siteInfo.faviconUrl, siteName])

  useEffect(() => {
    const appearance = appearanceQuery.data
    if (!appearance) return
    const accent = appearance.accentColor || '#0284C7'
    const hexToRgb = (hex) => {
      const normalized = hex.replace('#', '')
      const value = Number.parseInt(normalized.length === 3 ? normalized.split('').map((char) => char + char).join('') : normalized, 16)
      return { r: (value >> 16) & 255, g: (value >> 8) & 255, b: value & 255 }
    }
    const mix = (hex, target, weight) => {
      const color = hexToRgb(hex)
      const channel = (value, targetValue) => Math.round(value + (targetValue - value) * weight).toString(16).padStart(2, '0')
      return `#${channel(color.r, target)}${channel(color.g, target)}${channel(color.b, target)}`
    }
    const root = document.documentElement
    const palette = {
      '--blue-950': mix(accent, 0, .62), '--blue-900': mix(accent, 0, .48),
      '--blue-800': mix(accent, 0, .34), '--blue-700': mix(accent, 0, .18),
      '--blue-600': accent, '--blue-500': mix(accent, 255, .16),
      '--blue-400': mix(accent, 255, .32), '--blue-200': mix(accent, 255, .68),
      '--blue-100': mix(accent, 255, .84), '--blue-50': mix(accent, 255, .94),
      '--primary': accent, '--primary2': mix(accent, 255, .16), '--green': accent,
    }
    Object.entries(palette).forEach(([token, value]) => root.style.setProperty(token, value))
    root.dataset.theme = appearance.themeMode || 'light'
    root.style.colorScheme = appearance.themeMode || 'light'
  }, [appearanceQuery.data])

  useEffect(() => {
    if (!languageMenuOpen) return undefined
    const closeMenu = (event) => {
      if (event.key === 'Escape' || (event.type === 'pointerdown' && !languageMenuRef.current?.contains(event.target))) {
        setLanguageMenuOpen(false)
      }
    }
    document.addEventListener('pointerdown', closeMenu)
    document.addEventListener('keydown', closeMenu)
    return () => {
      document.removeEventListener('pointerdown', closeMenu)
      document.removeEventListener('keydown', closeMenu)
    }
  }, [languageMenuOpen])

  const selectLanguage = (code) => {
    setLanguageMenuOpen(false)
    if (code !== locale) switchLocale(code)
  }

  return (
    <div className="client-app-wrapper">
      <header className="client-header">
        <nav className="client-nav container">
          <Link className="logo" to={localizedPath('/')} style={{ display: 'flex', alignItems: 'center', gap: 0, textDecoration: 'none' }}>
            <img
              src={logoUrl}
              alt={`${siteName} logo`}
              width="128"
              height="80"
              fetchPriority="high"
              decoding="async"
              style={{ width: 128, height: 80, objectFit: 'contain' }}
            />
          </Link>
          <div className="menu">
            <NavLink to={localizedPath('/')} end>{t('navigation.home')}</NavLink>

            <div className="dropdown-container" onMouseEnter={() => setForceCloseDropdown(false)}>
              <a href="#" className={`dropdown-trigger ${isSolutionsActive ? 'active' : ''}`} onClick={(e) => e.preventDefault()} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {t('navigation.solutions')} <ChevronDown size={14} />
              </a>
              <div className="dropdown-menu" style={{ display: forceCloseDropdown ? 'none' : '' }} onClick={() => setForceCloseDropdown(true)}>
                <NavLink to={localizedPath('/giai-phap/chatbot')} className="dropdown-item">
                  <div className="dropdown-icon" style={{ backgroundColor: '#eff6ff', color: '#3b82f6' }}><Bot size={20} /></div>
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
                  <div className="dropdown-icon" style={{ backgroundColor: '#eff6ff', color: '#3b82f6' }}><Send size={20} /></div>
                  <div className="dropdown-text">
                    <h4>Marketing Automation</h4>
                    <p>Tối ưu chiến dịch, nuôi dưỡng khách hàng tự động</p>
                  </div>
                </NavLink>
              </div>
            </div>

            <div className="dropdown-container" onMouseEnter={() => setForceCloseDropdown(false)}>
              <a href="#" className={`dropdown-trigger ${isPricingActive ? 'active' : ''}`} onClick={(e) => e.preventDefault()} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {locale === 'en' ? 'Pricing' : 'Bảng giá'} <ChevronDown size={14} />
              </a>
              <div className="dropdown-menu" style={{ display: forceCloseDropdown ? 'none' : '' }} onClick={() => setForceCloseDropdown(true)}>
                <NavLink to={localizedPath('/bang-gia')} end className="dropdown-item">
                  <div className="dropdown-icon" style={{ backgroundColor: '#eff6ff', color: '#3b82f6' }}><Bot size={20} /></div>
                  <div className="dropdown-text">
                    <h4>{locale === 'en' ? 'Chatbot Pricing' : 'Bảng giá Chatbot'}</h4>
                    <p>{locale === 'en' ? '24/7 automation solution plans' : 'Các gói giải pháp tự động hóa 24/7'}</p>
                  </div>
                </NavLink>
                <div className="dropdown-divider"></div>
                <NavLink to={localizedPath('/bang-gia/crm')} className="dropdown-item">
                  <div className="dropdown-icon" style={{ backgroundColor: '#eff6ff', color: '#3b82f6' }}><BarChart2 size={20} /></div>
                  <div className="dropdown-text">
                    <h4>{locale === 'en' ? 'CRM Pricing' : 'Bảng giá CRM'}</h4>
                    <p>{locale === 'en' ? 'Comprehensive customer management plans' : 'Gói quản lý khách hàng toàn diện'}</p>
                  </div>
                </NavLink>
                <div className="dropdown-divider"></div>
                <NavLink to={localizedPath('/bang-gia/marketing')} className="dropdown-item">
                  <div className="dropdown-icon" style={{ backgroundColor: '#eff6ff', color: '#3b82f6' }}><Send size={20} /></div>
                  <div className="dropdown-text">
                    <h4>{locale === 'en' ? 'Marketing Pricing' : 'Bảng giá Marketing'}</h4>
                    <p>{locale === 'en' ? 'Automated marketing campaign plans' : 'Các gói chiến dịch tiếp thị tự động'}</p>
                  </div>
                </NavLink>
              </div>
            </div>
            <NavLink to={localizedPath('/blog')}>{t('navigation.knowledge')}</NavLink>

          </div>
          <div className="menu" style={{ gap: '16px' }}>
            <div className="language-picker" ref={languageMenuRef}>
              <button
                id="desktop-language-trigger"
                type="button"
                className="language-picker__trigger"
                aria-label={t('navigation.language')}
                aria-haspopup="menu"
                aria-expanded={languageMenuOpen}
                onClick={() => setLanguageMenuOpen((open) => !open)}
              >
                <span className="language-picker__flag" aria-hidden="true">{locale === 'en' ? <UnitedStatesFlag /> : <VietnamFlag />}</span>
              </button>
              <div className={`language-picker__menu ${languageMenuOpen ? 'is-open' : ''}`} role="menu" aria-hidden={!languageMenuOpen}>
                <button id="desktop-language-vi" type="button" role="menuitemradio" aria-checked={locale === 'vi'} onClick={() => selectLanguage('vi')}>
                  <VietnamFlag /><span>Tiếng Việt</span>
                </button>
                <button id="desktop-language-en" type="button" role="menuitemradio" aria-checked={locale === 'en'} onClick={() => selectLanguage('en')}>
                  <UnitedStatesFlag /><span>English</span>
                </button>
              </div>
            </div>
            {authType === 'client' ? (
              <>
                <NavLink to={localizedPath('/tai-khoan')} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><User size={18} /> {user?.name || t('common.account')}</NavLink>
                <a onClick={handleLogout} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>{t('common.logout')}</a>
              </>
            ) : (
              <NavLink to={localizedPath('/dang-nhap')} state={authNavigationState} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: '#374151' }}>
                <User size={18} /> {t('navigation.login')}
              </NavLink>
            )}
            <a className="btn btn-primary header-trial-btn" onClick={openLeadModal} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px' }}>
              <Rocket size={16} /> {t('navigation.trial')}
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

      <div className="client-footer-shell">
        <section className="client-cta-section" aria-labelledby="footer-cta-title">
          <div className="footer-ambient footer-ambient--one" aria-hidden="true"></div>
          <div className="footer-ambient footer-ambient--two" aria-hidden="true"></div>
          <div className="container">
            <div className="cta-grid">
              <div className="cta-content">
                <h2 id="footer-cta-title" className="cta-title">{t('cta.title')}</h2>
                <p className="cta-lead">{t('cta.lead')}</p>
                <ul className="cta-benefits">
                  <li><span className="cta-benefit-icon"><Check size={15} /></span><span><strong>{t('cta.benefitAutomation')}</strong>{t('cta.benefitAutomationText')}</span></li>
                  <li><span className="cta-benefit-icon"><Check size={15} /></span><span><strong>{t('cta.benefitScale')}</strong>{t('cta.benefitScaleText')}</span></li>
                  <li><span className="cta-benefit-icon"><Check size={15} /></span><span><strong>{t('cta.benefitAi')}</strong>{t('cta.benefitAiText')}</span></li>
                </ul>
                <div className="cta-trust-row">
                  <span><Shield size={15} /> {t('cta.dataSecurity')}</span>
                  <span><Headphones size={15} /> {t('cta.implementationSupport')}</span>
                  <span><Zap size={15} /> {t('cta.quickSetup')}</span>
                </div>
              </div>

              <div className="cta-form-card">
                <div className="cta-form-heading">
                  <div className="cta-form-icon"><Rocket size={21} /></div>
                  <div>
                    <span>{t('cta.free')}</span>
                    <h3>{t('cta.demo')}</h3>
                  </div>
                </div>
                <p className="cta-form-intro">{t('cta.intro')}</p>
                <Form form={footerForm} layout="vertical" onFinish={handleCtaSubmit} className="footer-dynamic-form">
                  <FooterDynamicLeadFields config={leadFormQuery.data} prefix="footer-lead" />
                  <button id="footer-demo-submit" type="submit" className="cta-submit-btn" disabled={ctaSubmitting || leadFormQuery.loading}>
                    {ctaSubmitting ? t('cta.sending') : <><span>{leadFormQuery.data?.submitLabel || t('cta.submit')}</span><ArrowRight size={17} /></>}
                  </button>
                </Form>
                <div className="cta-secure-note">
                  <Shield size={14} /> {t('cta.secure')}
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="client-footer">
          <div className="container">
            <div className="footer-main-grid">
              <section className="footer-brand-card" aria-label="Giới thiệu Losa247">
                <Link to={localizedPath('/')} className="footer-brand-link">
                  <img src={logoUrl} alt={`${siteName} logo`} width="144" height="54" loading="lazy" decoding="async" />
                </Link>
                <p className="footer-desc">{t('footer.description')}</p>
                <div className="footer-brand-pills">
                  <span><Bot size={14} /> {t('footer.omnichannelAi')}</span>
                  <span><CheckCircle size={14} /> {t('footer.support247')}</span>
                </div>
                <div className="footer-socials">
                  <a href={facebookUrl} target="_blank" rel="noreferrer" className="social-icon" aria-label="Facebook Losa247"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg></a>
                  <a href={facebookUrl} target="_blank" rel="noreferrer" className="social-icon" aria-label="Messenger Losa247"><MessageCircle size={18} /></a>
                  <a href={zaloUrl} target="_blank" rel="noreferrer" className="social-icon social-icon--zalo" aria-label="Zalo Losa247">Zalo</a>
                  <a href="#" className="social-icon" aria-label="YouTube Losa247"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg></a>
                </div>
              </section>

              <nav className="footer-nav-grid" aria-label="Điều hướng chân trang">
                <div className="footer-col">
                  <h3>{t('footer.products')}</h3>
                  <ul>
                    <li><Link to={localizedPath('/giai-phap/chatbot')}>Chatbot AI</Link></li>
                    <li><Link to={localizedPath('/giai-phap/crm')}>CRM</Link></li>
                    <li><Link to={localizedPath('/giai-phap/marketing')}>Marketing Automation</Link></li>
                    <li><Link to={localizedPath('/bang-gia')}>{t('footer.pricing')}</Link></li>
                  </ul>
                </div>
                <div className="footer-col">
                  <h3>{t('footer.resources')}</h3>
                  <ul>
                    <li><Link to={localizedPath('/blog')}>{t('footer.blog')}</Link></li>
                    <li><Link to="#">{t('footer.guide')}</Link></li>
                    <li><Link to="#">{t('footer.help')}</Link></li>
                    <li><Link to="#">{t('footer.faq')}</Link></li>
                  </ul>
                </div>
                <div className="footer-col">
                  <h3>{t('footer.company')}</h3>
                  <ul>
                    <li><Link to="#">{t('footer.about')}</Link></li>
                    <li><Link to="#">{t('footer.partners')}</Link></li>
                    <li><Link to="#">{t('footer.careers')}</Link></li>
                    <li><Link to="#">{t('footer.contact')}</Link></li>
                  </ul>
                </div>
              </nav>

              <section className="footer-contact-card" aria-labelledby="footer-contact-title">
                <span className="footer-contact-eyebrow">{t('footer.support')}</span>
                <h3 id="footer-contact-title">{t('footer.connect')}</h3>
                <a href={`tel:${hotline.replace(/\s/g, '')}`} className="footer-contact-item">
                  <span className="footer-contact-icon"><Phone size={17} /></span>
                  <span><small>{t('footer.hotline')}</small><strong>{hotline}</strong></span>
                </a>
                <a href={`mailto:${email}`} className="footer-contact-item">
                  <span className="footer-contact-icon"><Mail size={17} /></span>
                  <span><small>Email</small><strong>{email}</strong></span>
                </a>
                <div className="footer-contact-item">
                  <span className="footer-contact-icon"><MapPin size={17} /></span>
                  <span><small>{t('footer.office')}</small><strong>{address}</strong></span>
                </div>
              </section>
            </div>

            <div className="footer-bottom">
              <div className="footer-copyright">
                <span className="footer-trust-icon"><Shield size={15} /></span>
                <span>{t('footer.copyright')}</span>
              </div>
              <div className="footer-links">
                <Link to="#">{t('footer.privacy')}</Link>
                <Link to="#">{t('footer.terms')}</Link>
                <Link to="#">{t('footer.refund')}</Link>
              </div>
              <span className="footer-made-in"><span></span> {t('footer.madeIn')}</span>
            </div>
          </div>
        </footer>
      </div>

      <ChatWidget user={user} />
      <LeadFormModal />
      <Drawer
        title={t('navigation.menu')}
        placement="right"
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        className="mobile-nav-drawer"
        width={250}
      >
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <NavLink to={localizedPath('/')} className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>{t('navigation.home')}</NavLink>

          <div className="mobile-nav-submenu">
            <div className="mobile-nav-link" style={{ background: '#f8fafc', borderBottom: 'none', cursor: 'pointer' }} onClick={() => setMobileSolutionsOpen(!mobileSolutionsOpen)}>
              {t('navigation.solutions')} <ChevronDown size={16} style={{ transform: mobileSolutionsOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />
            </div>
            {mobileSolutionsOpen && (
              <div className="mobile-nav-submenu-panel">
                <NavLink to={localizedPath('/giai-phap/chatbot')} className="mobile-nav-sublink" onClick={() => setMobileMenuOpen(false)}><Bot size={16} /> Chatbot AI</NavLink>
                <NavLink to={localizedPath('/giai-phap/crm')} className="mobile-nav-sublink" onClick={() => setMobileMenuOpen(false)}><BarChart2 size={16} /> CRM</NavLink>
                <NavLink to={localizedPath('/giai-phap/marketing')} className="mobile-nav-sublink" onClick={() => setMobileMenuOpen(false)}><Send size={16} /> Marketing</NavLink>
              </div>
            )}
          </div>

          <div className="mobile-nav-submenu">
            <div className="mobile-nav-link" style={{ background: '#f8fafc', borderBottom: 'none', cursor: 'pointer' }} onClick={() => setMobilePricingOpen(!mobilePricingOpen)}>
              {t('navigation.pricing')} <ChevronDown size={16} style={{ transform: mobilePricingOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />
            </div>
            {mobilePricingOpen && (
              <div className="mobile-nav-submenu-panel">
                <NavLink to={localizedPath('/bang-gia')} end className="mobile-nav-sublink" onClick={() => setMobileMenuOpen(false)}><Bot size={16} /> {t('navigation.pricing')} Chatbot</NavLink>
                <NavLink to={localizedPath('/bang-gia/crm')} className="mobile-nav-sublink" onClick={() => setMobileMenuOpen(false)}><BarChart2 size={16} /> {t('navigation.pricing')} CRM</NavLink>
                <NavLink to={localizedPath('/bang-gia/marketing')} className="mobile-nav-sublink" onClick={() => setMobileMenuOpen(false)}><Send size={16} /> {t('navigation.pricing')} Marketing</NavLink>
              </div>
            )}
          </div>
          <NavLink to={localizedPath('/blog')} className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>{t('navigation.knowledge')}</NavLink>
          <div className="language-switcher" aria-label={t('navigation.language')} style={{ display: 'flex', gap: 8, padding: '16px 0 0' }}>
            {['vi', 'en'].map((code) => <button id={`mobile-language-${code}`} key={code} type="button" onClick={() => { switchLocale(code); setMobileMenuOpen(false) }} aria-pressed={locale === code} className="btn" style={{ flex: 1, border: `1px solid ${locale === code ? 'var(--blue-200)' : '#cbd5e1'}`, background: locale === code ? 'var(--blue-100)' : '#fff', color: locale === code ? 'var(--blue-700)' : '#334155' }}>{code.toUpperCase()}</button>)}
          </div>
        </div>

        <div style={{ padding: '24px', borderTop: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {authType === 'client' ? (
            <>
              <NavLink to={localizedPath('/tai-khoan')} className="btn btn-outline" style={{ display: 'flex', justifyContent: 'center', width: '100%', gap: '8px' }} onClick={() => setMobileMenuOpen(false)}><User size={18} /> {user?.name || t('common.account')}</NavLink>
              <button className="btn" style={{ background: '#f1f5f9', color: '#475569', width: '100%', border: 'none' }} onClick={() => { handleLogout(); setMobileMenuOpen(false); }}>{t('common.logout')}</button>
            </>
          ) : (
            <NavLink to={localizedPath('/dang-nhap')} state={authNavigationState} className="btn btn-outline" style={{ display: 'flex', justifyContent: 'center', width: '100%', gap: '8px' }} onClick={() => setMobileMenuOpen(false)}><User size={18} /> {t('navigation.login')}</NavLink>
          )}
          <button className="btn btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px' }} onClick={() => { openLeadModal(); setMobileMenuOpen(false); }}><Rocket size={16} /> {t('navigation.trial')}</button>
        </div>
      </Drawer>
    </div>
  )
}
