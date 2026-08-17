import { useMemo, useState, useEffect, useLayoutEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import EmojiPicker from 'emoji-picker-react'
import {
  Alert, App, Button, Card, Col, Descriptions, Drawer, Empty, Form, Input, InputNumber, List,
  Modal, Popconfirm, Row, Segmented, Select, Space, Spin, Statistic, Steps, Switch, Table, Tabs,
  Tag, Timeline, Typography, Upload, Dropdown, DatePicker,
} from 'antd'
import { Editor } from '@tinymce/tinymce-react'
import {
  DownloadOutlined, PlusOutlined, ReloadOutlined, SettingOutlined, UploadOutlined, LikeOutlined, DislikeOutlined, CloseOutlined,
  FileTextOutlined, CheckCircleOutlined, ClockCircleOutlined, EyeOutlined, SmileOutlined, PictureOutlined, PaperClipOutlined,
  SearchOutlined, MessageOutlined, SendOutlined
} from '@ant-design/icons'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid } from 'recharts'
import { useApiQuery } from '../../hooks/useApiQuery'
import { useDebounce } from '../../hooks/useDebounce'
import { useListParams } from '../../hooks/useListParams'
import { formatCurrency, formatDate } from '../../utils/format'
import { downloadBlob } from '../../utils/downloadBlob'
import { ORDER_STATUS, LEAD_STATUS, BLOG_STATUS, CHAT_MODE, ORDER_STEPS } from '../../constants/statusConfig'
import { dashboardService } from '../../features/dashboard/dashboardService'
import { leadsService } from '../../features/leads/leadsService'
import { blogsService, blogCategoriesService, blogTagsService } from '../../features/blogs/blogsService'
import { faqsService } from '../../features/faqs/faqsService'
import { servicesService } from '../../features/services/servicesService'
import { pricingService } from '../../features/services/pricingService'
import { chatService } from '../../features/chat/chatService'
import { logsService } from '../../features/logs/logsService'
import { usersService, rolesService } from '../../features/users/usersService'
import { settingsService, apiConfigsService } from '../../features/settings/settingsService'
import { useChatSocket } from '../../features/chat/useChatSocket'
import { useAuthStore } from '../../stores/authStore'
import dayjs from 'dayjs'

const { Title, Text } = Typography

// ---- Reusable bits --------------------------------------------------------
function PageHeader({ title, extra }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, gap: 16, flexWrap: 'wrap' }}>
      <div>
        <Title level={3} style={{ margin: 0 }}>{title}</Title>
      </div>
      <Space wrap>{extra}</Space>
    </div>
  )
}

function StatusTag({ map, value }) {
  const cfg = map[value] || { label: value || '—', color: 'default' }
  return <Tag color={cfg.color}>{cfg.label}</Tag>
}

// Bọc trạng thái loading/error/empty cho các khối dữ liệu.
function QueryState({ loading, error, empty, children }) {
  if (loading) return <div style={{ padding: 48, textAlign: 'center' }}><Spin /></div>
  if (error) return <Alert type="error" showIcon title={error} style={{ margin: '12px 0' }} />
  if (empty) return <Empty description="Chưa có dữ liệu" style={{ padding: 32 }} />
  return children
}

// ---- Dashboard ------------------------------------------------------------

export function AdminChat() {
  const { message } = App.useApp()
  const [activeId, setActiveId] = useState(null)
  const [text, setText] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [attachments, setAttachments] = useState([])
  const [uploading, setUploading] = useState(false)

  const chatScrollRef = useRef(null)
  const fileInputRef = useRef(null)
  const imageInputRef = useRef(null)
  const emojiPickerRef = useRef(null)
  const { search, onSearch, debounced, page, setPage, pageSize } = useListParams(5)
  const hasPermission = useAuthStore((state) => state.hasPermission)
  const user = useAuthStore((state) => state.user)
  const canView = hasPermission('chat.view')
  const canReply = hasPermission('chat.reply')
  const canAssign = hasPermission('chat.assign')
  const sessionsQ = useApiQuery(
    () => chatService.getSessions({ search: debounced || undefined, page, limit: pageSize }),
    [debounced, page],
    { enabled: canView },
  )
  const sessions = sessionsQ.data?.items || []
  const total = sessionsQ.data?.pagination?.total || 0
  const messagesQ = useApiQuery(() => chatService.getMessages(activeId), [activeId], { enabled: canView && !!activeId })
  const messages = messagesQ.data || []

  useLayoutEffect(() => {
    const container = chatScrollRef.current
    if (container) container.scrollTop = container.scrollHeight
  }, [activeId, messages])

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

  const appendMessage = (incoming) => {
    if (!incoming || (incoming.sessionId && incoming.sessionId !== activeId)) return
    messagesQ.setData((current) => {
      const list = Array.isArray(current) ? current : []
      const id = incoming._id || incoming.id
      if (id && list.some((item) => (item._id || item.id) === id)) return list
      return [...list, incoming]
    })
  }

  const { sendMessage } = useChatSocket(canView ? activeId : null, {
    role: canReply ? 'admin' : 'viewer',
    enabled: canView,
    onMessage: appendMessage,
    onPermissionError: () => message.error('Bạn không có quyền phản hồi hội thoại'),
  })

  const active = useMemo(() => sessions.find((s) => s._id === activeId), [sessions, activeId])

  const takeover = async () => { try { await chatService.takeover(activeId); message.success('Đã tiếp quản hội thoại'); sessionsQ.refetch() } catch { message.error('Lỗi tiếp quản') } }
  const release = async () => { try { await chatService.release(activeId); message.success('Đã trả về Bot'); sessionsQ.refetch() } catch { message.error('Lỗi trả về bot') } }
  const feedback = async (msgId, value) => { try { await chatService.setFeedback(msgId, value); message.success('Đã ghi nhận'); messagesQ.refetch() } catch { message.error('Lỗi') } }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const data = await settingsService.uploadAsset(file)
      if (data?.url) {
        setAttachments(prev => [...prev, data.url])
      }
    } catch (err) {
      console.error('Lỗi tải file:', err)
      message.error('Lỗi tải file')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const send = () => {
    if (!canReply) return message.error('Bạn không có quyền phản hồi hội thoại')
    if (!text.trim() && !attachments.length) return
    sendMessage(text, attachments)
    setText('')
    setAttachments([])
    setShowEmojiPicker(false)
  }

  const onEmojiClick = (emojiObject) => {
    setText(prev => prev + emojiObject.emoji)
  }

  if (!canView) return <Alert type="warning" showIcon message="Không có quyền truy cập Chat" description="Tài khoản cần quyền chat.view để xem các hội thoại." />

  return (
    <main className="admin-chat-page">
      <header className="admin-chat-page__header">
        <div>
          <span className="admin-chat-page__eyebrow">Hỗ trợ khách hàng</span>
          <Title level={3} className="admin-page-title">Trung tâm Chat</Title>
          <Text type="secondary">Theo dõi và phản hồi hội thoại theo thời gian thực</Text>
        </div>
        <Button id="admin-chat-refresh" icon={<ReloadOutlined />} onClick={sessionsQ.refetch}>Làm mới</Button>
      </header>

      <section className="admin-chat-workspace">
        <aside className="admin-chat-sessions" aria-label="Danh sách hội thoại">
          <div className="admin-chat-sessions__header">
            <div className="admin-chat-sessions__title">
              <strong>Hội thoại</strong>
              <span>{total}</span>
            </div>
            <Input
              id="admin-chat-search"
              allowClear
              prefix={<SearchOutlined />}
              placeholder="Tìm tên hoặc email"
              value={search}
              onChange={(event) => onSearch(event.target.value)}
            />
          </div>

          <div className="admin-chat-sessions__list">
            {sessionsQ.loading ? (
              <div className="admin-chat-state"><Spin /></div>
            ) : !sessions.length ? (
              <div className="admin-chat-state"><Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có phiên chat" /></div>
            ) : sessions.map((session) => (
              <button
                id={`admin-chat-session-${session._id}`}
                type="button"
                key={session._id}
                className={`admin-chat-session ${session._id === activeId ? 'is-active' : ''}`}
                onClick={() => setActiveId(session._id)}
              >
                <div className="admin-chat-session__top">
                  <div className="admin-chat-session__identity">
                    <strong>{session.customerName || 'Khách ẩn danh'}</strong>
                    <span>{session.customerEmail || 'Chưa có email'}</span>
                  </div>
                  <StatusTag map={CHAT_MODE} value={session.mode} />
                </div>
              </button>
            ))}
          </div>

          {total > pageSize && (
            <div className="admin-chat-sessions__pagination">
              <Button id="admin-chat-prev-page" size="small" disabled={page <= 1} onClick={() => setPage(page - 1)}>Trước</Button>
              <span>{page} / {Math.ceil(total / pageSize)}</span>
              <Button id="admin-chat-next-page" size="small" disabled={page >= Math.ceil(total / pageSize)} onClick={() => setPage(page + 1)}>Sau</Button>
            </div>
          )}
        </aside>

        <section className="admin-chat-conversation" aria-label="Nội dung hội thoại">
          <header className="admin-chat-conversation__header">
            <div>
              <div className="admin-chat-conversation__name">{active ? (active.customerName || 'Khách ẩn danh') : 'Chọn một hội thoại'}</div>
              {active && <div className="admin-chat-conversation__email">{active.customerEmail || 'Chưa có email'}</div>}
              {!active && <div className="admin-chat-conversation__status">Danh sách hội thoại ở cột bên trái</div>}
            </div>
            {active && canAssign && (active.mode === 'bot'
              ? <Button id="admin-chat-takeover" type="primary" onClick={takeover}>Nhảy vào hội thoại</Button>
              : <Button id="admin-chat-release" onClick={release}>Trả về cho Bot</Button>)}
          </header>

          <div className="admin-chat-conversation__body">
            <QueryState loading={messagesQ.loading} empty={activeId && !messages.length} error={messagesQ.error}>
              {!activeId ? (
                <div className="admin-chat-welcome">
                  <div className="admin-chat-welcome__icon"><MessageOutlined /></div>
                  <Title level={4}>Sẵn sàng hỗ trợ khách hàng</Title>
                  <Text type="secondary">Chọn một hội thoại để xem lịch sử và bắt đầu phản hồi.</Text>
                </div>
              ) : (
                <div ref={chatScrollRef} className="admin-chat-messages">
                  {messages.map((chatMessage) => {
                    const sender = chatMessage.sender || 'customer'
                    let senderLabel = sender === 'customer' ? (active?.customerName || 'Khách ẩn danh') : sender === 'bot' ? 'Trợ lý AI' : (user?.name || 'Nhân viên')
                    return (
                      <article key={chatMessage._id} className={`admin-chat-message admin-chat-message--${sender}`}>
                        {sender !== 'customer' && <span className="admin-chat-message__sender">{senderLabel}</span>}
                        <div className="admin-chat-message__bubble">
                          {chatMessage.content && <div>{chatMessage.content}</div>}
                          {chatMessage.attachments?.map((url, index) => (
                            <img key={index} src={url} alt="Tệp đính kèm trong hội thoại" />
                          ))}
                        </div>
                        {sender === 'bot' && canReply && (
                          <div className="admin-chat-message__feedback">
                            <Button id={`admin-chat-like-${chatMessage._id}`} type="text" size="small" icon={<LikeOutlined />} onClick={() => feedback(chatMessage._id, 'good')} />
                            <Button id={`admin-chat-dislike-${chatMessage._id}`} type="text" size="small" icon={<DislikeOutlined />} onClick={() => feedback(chatMessage._id, 'bad')} />
                          </div>
                        )}
                      </article>
                    )
                  })}
                </div>
              )}
            </QueryState>
          </div>

          {activeId && canReply && (
            <footer className="admin-chat-composer">
              {showEmojiPicker && (
                <div ref={emojiPickerRef} className="admin-chat-emoji-picker">
                  <EmojiPicker onEmojiClick={onEmojiClick} height={350} width={300} />
                </div>
              )}
              {attachments.length > 0 && (
                <div className="admin-chat-attachments">
                  {attachments.map((url, index) => (
                    <div className="admin-chat-attachment" key={url}>
                      <img src={url} alt={`Tệp xem trước ${index + 1}`} />
                      <Button id={`admin-chat-remove-attachment-${index}`} danger shape="circle" icon={<CloseOutlined />} size="small" onClick={() => setAttachments((current) => current.filter((_, itemIndex) => itemIndex !== index))} />
                    </div>
                  ))}
                </div>
              )}
              {uploading && <div className="admin-chat-uploading">Đang tải file lên...</div>}
              <div className="admin-chat-composer__box">
                <Input
                  id="admin-chat-message-input"
                  placeholder="Nhập phản hồi..."
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                  onPressEnter={send}
                />
                <div className="admin-chat-composer__tools">
                  <Button id="admin-chat-emoji" type="text" icon={<SmileOutlined />} onClick={() => setShowEmojiPicker(!showEmojiPicker)} />
                  <Button id="admin-chat-image" type="text" icon={<PictureOutlined />} onClick={() => imageInputRef.current?.click()} />
                  <Button id="admin-chat-file" type="text" icon={<PaperClipOutlined />} onClick={() => fileInputRef.current?.click()} />
                </div>
                <Button id="admin-chat-send" type="primary" icon={<SendOutlined />} onClick={send} disabled={uploading || (!text.trim() && !attachments.length)}>Gửi</Button>
              </div>
              <input type="file" hidden ref={imageInputRef} accept="image/*" onChange={handleFileUpload} />
              <input type="file" hidden ref={fileInputRef} onChange={handleFileUpload} />
            </footer>
          )}
        </section>
      </section>
    </main>
  )
}

// ---- Logs -----------------------------------------------------------------
