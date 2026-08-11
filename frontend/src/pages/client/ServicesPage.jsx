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
import { ClientFaqSection } from '../../components/client/ClientFaqSection'
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

export function ServicesPage() {
  const plansQuery = useApiQuery(() => publicPricingService.getPlans(), [])
  const compQuery = useApiQuery(() => publicPricingService.getComparisons(), [])
  const faqsQuery = useApiQuery(() => publicFaqsService.getList({ pageType: 'pricing' }), [])

  const [faqOpen, setFaqOpen] = useState(null)

  const plans = plansQuery.data?.items || []
  const comparisons = compQuery.data?.items || []
  const faqs = faqsQuery.data?.items || []

  const getIcon = (order) => {
    if (order === 1) return <Rocket size={28} className="text-green-600" />
    if (order === 2) return <BriefcaseBusiness size={28} className="text-green-600" />
    return <Building2 size={28} className="text-green-600" />
  }

  return (
    <main className="saas-main-wrapper">
      {/* Hero Section */}
      <div className="saas-hero-container">
        <div className="container saas-hero-grid centered-hero">
          <div className="saas-hero-content">
            <h1 className="saas-hero-title">Bảng giá <span>Chatbot</span></h1>
            <p className="saas-hero-desc">Tự động hóa quy trình bán hàng với AI thông minh giúp bạn chăm sóc khách hàng 24/7, chốt đơn hiệu quả và tăng trưởng doanh số vượt trội.</p>

            <div className="saas-hero-features">
              <div className="saas-hf-item"><CheckCircleOutlined className="saas-icon-check" /> Tự động 24/7</div>
              <div className="saas-hf-item"><CheckCircleOutlined className="saas-icon-check" /> Tối ưu chi phí</div>
              <div className="saas-hf-item"><CheckCircleOutlined className="saas-icon-check" /> Dễ dàng tích hợp</div>
              <div className="saas-hf-item"><CheckCircleOutlined className="saas-icon-check" /> Báo cáo chi tiết</div>
            </div>
          </div>
        </div>
      </div>

      <div className="saas-content-section saas-fluid-container">
        <Spin spinning={plansQuery.loading || compQuery.loading || faqsQuery.loading}>
          {!plans.length && !plansQuery.loading ? <Empty description="Chưa có gói dịch vụ" /> : (
            <>
              {/* Pricing Cards */}
              <PricingSection />

              {/* Comparison Table */}
              {comparisons.length > 0 && (
                <div className="saas-comparison-wrapper">
                  <h2 className="saas-section-title">So sánh chi tiết các gói</h2>
                  <div className="saas-table-container">
                    <table className="saas-comparison-table">
                      <thead>
                        <tr>
                          <th>TÍNH NĂNG</th>
                          {plans.map(p => (
                            <th key={p._id}>{p.name}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {comparisons.map(c => (
                          <tr key={c._id}>
                            <td className="saas-td-feature-name">
                              {c.title.toLowerCase().includes('agent') && <RobotOutlined />}
                              {c.title.toLowerCase().includes('zalo') && <CommentOutlined />}
                              {c.title.toLowerCase().includes('crm') && <ContactsOutlined />}
                              {c.title.toLowerCase().includes('workflow') && <PartitionOutlined />}
                              {c.title.toLowerCase().includes('báo cáo') && <LineChartOutlined />}
                              {c.title.toLowerCase().includes('hỗ trợ') && <CustomerServiceOutlined />}
                              {!c.title.toLowerCase().includes('agent') && !c.title.toLowerCase().includes('zalo') && !c.title.toLowerCase().includes('crm') && !c.title.toLowerCase().includes('workflow') && !c.title.toLowerCase().includes('báo cáo') && !c.title.toLowerCase().includes('hỗ trợ') && <CheckCircleOutlined />}
                              <span>{c.title}</span>
                            </td>
                            {plans.map(p => (
                              <td key={p._id}>
                                {c.values?.[p._id] === 'yes' || c.values?.[p._id] === true ? (
                                  <CheckCircleOutlined className="saas-icon-check" />
                                ) : c.values?.[p._id] === 'no' || c.values?.[p._id] === false ? (
                                  <CloseOutlined className="saas-icon-close" />
                                ) : (
                                  <span className="saas-text-value">{c.values?.[p._id]}</span>
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </>
          )}
        </Spin>
      </div>

      {faqs.length > 0 && (
        <ClientFaqSection faqs={faqs} />
      )}

    </main>
  )
}

