import { CountUpAnimation } from '../../components/ui/CountUpAnimation';
import { Reveal } from '../../components/ui/Reveal';
import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  CircleCheck, Crown, Gem, Check, X, TrendingUp, Star, ChevronDown, ChevronUp,
  Calendar, Tag as LucideTag, Phone, Mail, MessageSquare, MapPin, BellDot, Camera, Mic, Send, ChevronLeft, MoreVertical, Signal, Wifi, BatteryFull,
  Globe, MessagesSquare, Hourglass, UserRoundCheck, Database, RefreshCcw,
  Headset, Brain, Share2, Users, Bot, BarChart3,
  MessageCircleMore, FileText, ShoppingCart, ClipboardList, UserRoundCog, HeartHandshake, ArrowRight, MessageCircle,
  MessageSquareMore, SearchCheck, PencilRuler, Rocket, ShieldCheck, Handshake
} from "lucide-react";
import { FaFacebookMessenger, FaTelegramPlane, FaInstagram, FaWhatsapp, FaYoutube, FaLinkedin, FaFacebook } from "react-icons/fa";
import { SiZalo } from "react-icons/si";
import PricingSection from '../../components/client/pricing/PricingSection'
import { App, Button, Empty, Form, Input, InputNumber, Result, Spin, Steps, Select, Pagination, Tag, Skeleton, Collapse, Modal } from 'antd'
import { SearchOutlined, FilterOutlined, CalendarOutlined, EyeOutlined, RightOutlined, CheckCircleOutlined, CloseOutlined, TrophyOutlined, ToolOutlined, TeamOutlined, MenuOutlined, RocketOutlined, ProjectOutlined, BankOutlined, ThunderboltOutlined, ClockCircleOutlined, DollarOutlined, SafetyOutlined, RobotOutlined, CommentOutlined, ContactsOutlined, PartitionOutlined, LineChartOutlined, CustomerServiceOutlined, DownOutlined, UpOutlined, UserOutlined, CrownOutlined, MessageOutlined, GlobalOutlined, InstagramOutlined, DatabaseOutlined, ShoppingCartOutlined, HeartOutlined } from '@ant-design/icons'
import { motion, AnimatePresence } from 'framer-motion'
import { useApiQuery } from '../../hooks/useApiQuery'
import { formatCurrency, formatDate } from '../../utils/format'
import { publicServicesService } from '../../features/services/servicesService'
import { publicStoreProductsService } from '../../features/storeProducts/storeProductsService'
import { publicBlogsService } from '../../features/blogs/blogsService'
import { publicFaqsService } from '../../features/faqs/faqsService'
import { publicPricingService } from '../../features/services/pricingService'
import { cartService } from '../../features/cart/cartService'
import { checkoutService } from '../../features/checkout/checkoutService'
import { leadsService } from '../../features/leads/leadsService'
import { useUIStore } from '../../stores/uiStore'
import { useAuthStore } from '../../stores/authStore'
import { useDebounce } from '../../hooks/useDebounce'

// Hook thêm sản phẩm/dịch vụ vào giỏ (yêu cầu đăng nhập client).
function useAddToCart() {
  const { message } = App.useApp()
  const navigate = useNavigate()
  const { authType } = useAuthStore()
  return async (payload) => {
    if (authType !== 'client') {
      message.info('Vui lòng đăng nhập để thêm vào giỏ hàng')
      navigate('/dang-nhap')
      return
    }
    try { await cartService.addItem(payload); message.success('Đã thêm vào giỏ hàng') }
    catch (e) { message.error(e?.error?.message || 'Không thêm được vào giỏ') }
  }
}

// ---- Components -------------------------------------------------------------

export function CartPage() {
  const { message } = App.useApp()
  const navigate = useNavigate()
  const { authType } = useAuthStore()
  const query = useApiQuery(() => cartService.getCart(), [], { enabled: authType === 'client' })
  const items = query.data || []

  const lineOf = (it) => (it.serviceId?.price ?? it.storeProductId?.price ?? it.price ?? 0) * (it.qty || 1)
  const total = items.reduce((sum, it) => sum + lineOf(it), 0)

  const updateQty = async (it, qty) => {
    if (qty < 1) return
    try { await cartService.updateItem(it._id, qty); query.refetch() } catch { message.error('Không cập nhật được') }
  }
  const remove = async (it) => {
    try { await cartService.removeItem(it._id); message.success('Đã xoá'); query.refetch() } catch { message.error('Không xoá được') }
  }

  if (authType !== 'client') {
    return <main className="section"><div className="container"><Result status="info" title="Đăng nhập để xem giỏ hàng" extra={<Link className="btn btn-primary" to="/dang-nhap">Đăng nhập</Link>} /></div></main>
  }

  return (
    <main className="section"><div className="container cart-layout">
      <div className="card price-card">
        <h1>Giỏ hàng</h1>
        <Spin spinning={query.loading}>
          {!items.length && !query.loading ? <Empty description="Giỏ hàng trống" /> : items.map((it) => {
            const name = it.serviceId?.name || it.storeProductId?.name || it.name || 'Sản phẩm'
            return (
              <div key={it._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '8px 0', borderBottom: '1px solid #eee' }}>
                <span>🛒 {name}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <InputNumber min={1} value={it.qty} onChange={(v) => updateQty(it, v)} size="small" style={{ width: 70 }} />
                  <b>{formatCurrency(lineOf(it))}</b>
                  <Button size="small" danger onClick={() => remove(it)}>Xoá</Button>
                </span>
              </div>
            )
          })}
        </Spin>
      </div>
      <aside className="card price-card">
        <h2>Tổng kết</h2>
        <p>Tạm tính: <b>{formatCurrency(total)}</b></p>
        <Button type="primary" disabled={!items.length} onClick={() => navigate('/thanh-toan')} block>Tiến hành thanh toán</Button>
      </aside>
    </div></main>
  )
}

// ---- Checkout -------------------------------------------------------------
