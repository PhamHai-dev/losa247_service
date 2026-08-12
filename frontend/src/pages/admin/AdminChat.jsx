import { useMemo, useState, useEffect, useRef } from 'react'
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
  FileTextOutlined, CheckCircleOutlined, ClockCircleOutlined, EyeOutlined, SmileOutlined, PictureOutlined, PaperClipOutlined
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
import { ordersService } from '../../features/orders/ordersService'
import { cartsAdminService } from '../../features/carts/cartsAdminService'
import { blogsService, blogCategoriesService, blogTagsService } from '../../features/blogs/blogsService'
import { faqsService } from '../../features/faqs/faqsService'
import { servicesService } from '../../features/services/servicesService'
import { pricingService } from '../../features/services/pricingService'
import { storeProductsService } from '../../features/storeProducts/storeProductsService'
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
  
  const chatEndRef = useRef(null)
  const fileInputRef = useRef(null)
  const imageInputRef = useRef(null)
  const emojiPickerRef = useRef(null)
  const { search, onSearch, debounced, page, setPage, pageSize } = useListParams(5)
  const hasPermission = useAuthStore((state) => state.hasPermission)
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

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

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

  const { sendMessage } = useChatSocket(canView ? activeId : null, {
    role: canReply ? 'admin' : 'viewer',
    enabled: canView,
    onMessage: () => messagesQ.refetch(),
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
    setTimeout(() => messagesQ.refetch(), 300)
  }

  const onEmojiClick = (emojiObject) => {
    setText(prev => prev + emojiObject.emoji)
  }

  if (!canView) return <Alert type="warning" showIcon message="Không có quyền truy cập Chat" description="Tài khoản cần quyền chat.view để xem các hội thoại." />

  return (
    <>
      <PageHeader title="Trung tâm Chat" extra={<Button icon={<ReloadOutlined />} onClick={sessionsQ.refetch}>Làm mới</Button>} />
      <Row gutter={16}>
        <Col xs={24} md={8}>
          <Input.Search allowClear placeholder="Tìm tên / SĐT khách" value={search} onChange={(e) => onSearch(e.target.value)} style={{ marginBottom: 12 }} />
          <Card styles={{ body: { padding: 0, maxHeight: 'calc(100vh - 280px)', overflow: 'auto' } }}>
            <List
              loading={sessionsQ.loading}
              dataSource={sessions}
              locale={{ emptyText: 'Chưa có phiên chat' }}
              pagination={total > pageSize ? { current: page, pageSize, total, onChange: setPage, size: 'small', align: 'center' } : false}
              renderItem={(s) => (
                <List.Item onClick={() => setActiveId(s._id)}
                  style={{ padding: 12, cursor: 'pointer', background: s._id === activeId ? '#CCFBF1' : undefined }}>
                  <List.Item.Meta
                    title={<Space>{s.customerName || 'Khách ẩn danh'} <StatusTag map={CHAT_MODE} value={s.mode} /></Space>}
                    description={s.customerPhone || 'Ẩn danh'} />
                </List.Item>
              )} />
          </Card>
        </Col>
        <Col xs={24} md={16}>
          <Card
            title={active ? (active.customerName || 'Khách ẩn danh') : 'Chọn một phiên chat'}
            extra={active && canAssign && (active.mode === 'bot'
              ? <Button size="small" type="primary" onClick={takeover}>Nhảy vào hội thoại</Button>
              : <Button size="small" onClick={release}>Trả về cho Bot</Button>)}
          >
            <QueryState loading={messagesQ.loading} empty={activeId && !messages.length} error={messagesQ.error}>
              {!activeId ? <Empty description="Chọn phiên để xem hội thoại" /> : (
                <div style={{ height: 'calc(100vh - 380px)', minHeight: 300, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 8, paddingRight: 4 }}>
                  {messages.map((m) => (
                    <div key={m._id} style={{ alignSelf: m.sender === 'customer' ? 'flex-start' : 'flex-end', maxWidth: '70%' }}>
                      <div style={{ padding: '8px 12px', borderRadius: 12, background: m.sender === 'customer' ? '#F1F5F9' : '#CCFBF1' }}>
                        {m.content && <div>{m.content}</div>}
                        {m.attachments?.map((url, i) => (
                          <img key={i} src={url} alt="attachment" style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8, marginTop: m.content ? 8 : 0, display: 'block' }} />
                        ))}
                      </div>
                      {m.sender === 'bot' && canReply && (
                        <Space size={4} style={{ marginTop: 2 }}>
                          <Button type="text" size="small" icon={<LikeOutlined />} onClick={() => feedback(m._id, 'good')} />
                          <Button type="text" size="small" icon={<DislikeOutlined />} onClick={() => feedback(m._id, 'bad')} />
                        </Space>
                      )}
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
              )}
            </QueryState>
            {activeId && canReply && (
              <div style={{ position: 'relative', marginTop: 12 }}>
                {showEmojiPicker && (
                  <div ref={emojiPickerRef} style={{ position: 'absolute', bottom: '100%', left: 0, zIndex: 10 }}>
                    <EmojiPicker onEmojiClick={onEmojiClick} height={350} width={300} />
                  </div>
                )}
                
                {attachments.length > 0 && (
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8, overflowX: 'auto', paddingBottom: 4 }}>
                    {attachments.map((url, i) => (
                      <div key={i} style={{ position: 'relative', flexShrink: 0 }}>
                        <img src={url} alt="preview" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8 }} />
                        <Button 
                          type="primary" 
                          danger 
                          shape="circle" 
                          icon={<CloseOutlined />} 
                          size="small"
                          style={{ position: 'absolute', top: -5, right: -5, width: 20, height: 20, minWidth: 20 }}
                          onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {uploading && <div style={{ fontSize: 12, color: '#1677ff', marginBottom: 8 }}>Đang tải file lên...</div>}

                <Space.Compact style={{ width: '100%' }}>
                  <Input placeholder="Nhập phản hồi..." value={text} onChange={(e) => setText(e.target.value)} onPressEnter={send} />
                  <Button icon={<SmileOutlined />} onClick={() => setShowEmojiPicker(!showEmojiPicker)} />
                  <Button icon={<PictureOutlined />} onClick={() => imageInputRef.current?.click()} />
                  <Button icon={<PaperClipOutlined />} onClick={() => fileInputRef.current?.click()} />
                  <Button type="primary" onClick={send} disabled={uploading}>Gửi</Button>
                </Space.Compact>

                <input type="file" hidden ref={imageInputRef} accept="image/*" onChange={handleFileUpload} />
                <input type="file" hidden ref={fileInputRef} onChange={handleFileUpload} />
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </>
  )
}

// ---- Logs -----------------------------------------------------------------
