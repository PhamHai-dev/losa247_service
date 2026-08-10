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

export function CheckoutPage() {
  const { message } = App.useApp()
  const { authType, user } = useAuthStore()
  const [step, setStep] = useState(0)
  const [order, setOrder] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [form] = Form.useForm()

  const submit = async (values) => {
    setSubmitting(true)
    try {
      const created = await checkoutService.createOrder(values)
      setOrder(created)
      setStep(2)
      message.success('Đặt hàng thành công')
    } catch (e) {
      message.error(e?.error?.message || 'Không tạo được đơn hàng')
    } finally { setSubmitting(false) }
  }

  if (authType !== 'client') {
    return <main className="section"><div className="container"><Result status="info" title="Đăng nhập để thanh toán" extra={<Link className="btn btn-primary" to="/dang-nhap">Đăng nhập</Link>} /></div></main>
  }

  return (
    <main className="section"><div className="container card price-card">
      <h1>Thanh toán</h1>
      <Steps current={step} style={{ margin: '20px 0' }}
        items={[{ title: 'Thông tin' }, { title: 'Xác nhận' }, { title: 'Hoàn tất' }]} />

      {step < 2 && (
        <Form form={form} layout="vertical" initialValues={{ customerName: user?.name, customerPhone: user?.phone, customerEmail: user?.email, paymentMethod: 'transfer' }}
          onFinish={submit} onValuesChange={() => setStep(1)}>
          <Form.Item name="customerName" label="Họ tên" rules={[{ required: true, message: 'Nhập họ tên' }]}><Input /></Form.Item>
          <Form.Item name="customerPhone" label="Số điện thoại" rules={[{ required: true, min: 9, message: 'SĐT không hợp lệ' }]}><Input /></Form.Item>
          <Form.Item name="customerEmail" label="Email"><Input /></Form.Item>
          <Form.Item name="paymentMethod" label="Phương thức"><Input placeholder="transfer / momo / vnpay" /></Form.Item>
          <Button type="primary" htmlType="submit" loading={submitting}>Đặt hàng</Button>
        </Form>
      )}

      {step === 2 && order && (
        <Result status="success" title="Đặt hàng thành công!" subTitle={`Mã đơn: ${order.code} • Tổng: ${formatCurrency(order.total)}`}
          extra={[<Link className="btn btn-primary" to="/tai-khoan" key="acc">Về tài khoản</Link>]} />
      )}
    </div></main>
  )
}

