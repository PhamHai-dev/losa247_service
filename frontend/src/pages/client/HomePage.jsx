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

export function HomePage() {
  const blogsQ = useApiQuery(() => publicBlogsService.getList({ limit: 3 }), [])
  const blogs = blogsQ.data?.items || []

  const faqsQuery = useApiQuery(() => publicFaqsService.getList({ pageType: 'home' }), [])
  const homeFaqs = faqsQuery.data?.items || []

  const chatScrollRef = useRef(null);
  const mockupRef = useRef(null);
  const [inView, setInView] = useState(false);
  const [visibleCount, setVisibleCount] = useState(0);
  const openLeadModal = useUIStore((state) => state.openLeadModal);

  const scrollToBottom = () => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTo({
        top: chatScrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setInView(entry.isIntersecting);
    }, { threshold: 0.5 });
    if (mockupRef.current) observer.observe(mockupRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (inView) {
      if (visibleCount < 17) {
        const timer = setTimeout(() => {
          setVisibleCount(prev => prev + 1);
          setTimeout(scrollToBottom, 100);
        }, visibleCount === 0 ? 500 : 1000);
        return () => clearTimeout(timer);
      } else {
        const resetTimer = setTimeout(() => {
          setVisibleCount(0);
        }, 3000);
        return () => clearTimeout(resetTimer);
      }
    }
  }, [inView, visibleCount]);

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const stagger = {
    visible: { transition: { staggerChildren: 0.15 } }
  };

  const chatContainer = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.5,
        staggerChildren: 0.8
      }
    }
  };

  const chatBubble = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 20 } }
  };

  return (
    <div className="client-app-wrapper" style={{ background: 'white' }}>
      {/* HERO SECTION */}
      <section className="saas-hero">
        <div className="saas-container saas-hero-grid">
          <motion.div className="saas-hero-content" initial="hidden" animate="visible" variants={stagger}>
            <motion.h1 variants={fadeUp}>Tự động hóa chăm sóc <br /> khách hàng 24/7 với <br /> <span style={{ color: 'var(--saas-primary)' }}>Chatbot AI</span></motion.h1>
            <motion.p variants={fadeUp}>Giải pháp chatbot thông minh giúp doanh nghiệp tiết kiệm chi phí, tăng tỷ lệ chuyển đổi và nâng cao trải nghiệm khách hàng.</motion.p>
            <motion.ul className="saas-hero-benefits" variants={fadeUp}>
              <li><CircleCheck size={20} color="#10B981" /> Trả lời tự động 24/7</li>
              <li><CircleCheck size={20} color="#10B981" /> Giảm 80% thời gian tư vấn</li>
              <li><CircleCheck size={20} color="#10B981" /> Tăng 35% tỷ lệ chốt đơn</li>
            </motion.ul>
            <motion.div className="saas-hero-actions" variants={fadeUp}>
              <button className="saas-btn saas-btn-primary" onClick={openLeadModal} style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>Nhận tư vấn miễn phí</button>
            </motion.div>
          </motion.div>

          <div className="saas-hero-visual">
            <img src="https://res.cloudinary.com/e1d8bnbg/image/upload/v1784878046/logo_bot_home_gmhrdk.png" alt="Robot AI" className="saas-robot" />

            <div className="saas-platform-icon" style={{position: 'absolute', top: '10%', right: '10%', zIndex: 5}}><FaFacebookMessenger size={28} color="#0084FF" /></div>
            <div className="saas-platform-icon" style={{position: 'absolute', bottom: '15%', right: '5%', zIndex: 5}}><Globe size={28} color="#0EA5E9" /></div>
            <div className="saas-platform-icon" style={{position: 'absolute', top: '30%', left: '10%', zIndex: 5}}><SiZalo size={28} color="#0068FF" /></div>
            <div className="saas-platform-icon" style={{position: 'absolute', bottom: '25%', left: '5%', zIndex: 5}}><FaTelegramPlane size={28} color="#229ED9" /></div>
            <div className="saas-platform-icon" style={{position: 'absolute', top: '-5%', left: '40%', zIndex: 5}}><FaInstagram size={28} color="#E1306C" /></div>
            <div className="saas-platform-icon" style={{position: 'absolute', bottom: '-5%', right: '40%', zIndex: 5}}><FaWhatsapp size={28} color="#25D366" /></div>
            <div className="saas-platform-icon icon-insta"><FaInstagram size={28} color="#E1306C" /></div>

            <motion.div ref={mockupRef} className="iphone-mockup" initial={{ x: 100, opacity: 0, scale: 0.9 }} animate={{ x: 0, opacity: 1, scale: 1 }} transition={{ duration: 0.8, type: "spring" }}>
              <div className="iphone-notch"></div>

              <div style={{ position: 'absolute', top: 16, left: 26, right: 22, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, fontWeight: 600, zIndex: 20 }}>
                <span style={{ letterSpacing: -0.5 }}>9:41</span>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <Signal size={14} strokeWidth={2.5} />
                  <Wifi size={14} strokeWidth={2.5} />
                  <BatteryFull size={16} strokeWidth={2} />
                </div>
              </div>

              <div className="iphone-screen" style={{ paddingTop: 0 }} ref={chatScrollRef}>
                <div className="iphone-chat-header" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  borderBottom: '1px solid #E5E7EB', paddingBottom: 10, marginBottom: 12,
                  position: 'sticky', top: 0, zIndex: 15, background: '#FFFFFF',
                  paddingTop: 38, margin: '0 -16px', paddingLeft: 16, paddingRight: 16
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <ChevronLeft size={24} color="#0070F3" style={{ marginLeft: -4 }} />
                    <img src="https://res.cloudinary.com/e1d8bnbg/image/upload/v1784799281/logo_blog_qd9i4n.png" style={{ width: 28, height: 28, borderRadius: 8 }} alt="Avatar" />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4, lineHeight: 1 }}>
                        Trợ lý ảo Losa <Check size={12} color="#0070F3" />
                      </div>
                      <span style={{ fontSize: 10, color: '#6B7280', lineHeight: 1 }}>Đang hoạt động</span>
                    </div>
                  </div>
                  <MoreVertical size={20} color="#0070F3" />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingBottom: 60 }}>

                  {visibleCount >= 1 && (
                    <motion.div variants={chatBubble} initial="hidden" animate="visible" className="iphone-bubble-wrapper user" style={{ originX: 1, originY: 1 }}>
                      <div className="iphone-bubble">Shop ơi</div>
                    </motion.div>
                  )}

                  {visibleCount >= 2 && (
                    <motion.div variants={chatBubble} initial="hidden" animate="visible" className="iphone-bubble-wrapper user" style={{ originX: 1, originY: 1 }}>
                      <div className="iphone-bubble">Tư vấn cho mình giải pháp Chatbot với</div>
                    </motion.div>
                  )}

                  {visibleCount >= 3 && (
                    <motion.div variants={chatBubble} initial="hidden" animate="visible" className="iphone-bubble-wrapper bot" style={{ originX: 0, originY: 1 }}>
                      <div style={{ width: 28, flexShrink: 0 }}></div>
                      <div className="iphone-bubble">Dạ, Losa AI chào anh/chị! 👋</div>
                    </motion.div>
                  )}

                  {visibleCount >= 4 && (
                    <motion.div variants={chatBubble} initial="hidden" animate="visible" className="iphone-bubble-wrapper bot" style={{ originX: 0, originY: 1 }}>
                      <img src="https://res.cloudinary.com/e1d8bnbg/image/upload/v1784799281/logo_blog_qd9i4n.png" className="iphone-avatar" alt="Bot" />
                      <div className="iphone-bubble">Fanpage mình đang gặp vấn đề quá tải tin nhắn phải không ạ?</div>
                    </motion.div>
                  )}

                  {visibleCount >= 5 && (
                    <motion.div variants={chatBubble} initial="hidden" animate="visible" className="iphone-bubble-wrapper user" style={{ originX: 1, originY: 1 }}>
                      <div className="iphone-bubble">Đúng rồi shop</div>
                    </motion.div>
                  )}

                  {visibleCount >= 6 && (
                    <motion.div variants={chatBubble} initial="hidden" animate="visible" className="iphone-bubble-wrapper user" style={{ originX: 1, originY: 1 }}>
                      <div className="iphone-bubble">Khách nhắn lúc nửa đêm toàn bị miss đơn 🥲</div>
                    </motion.div>
                  )}

                  {visibleCount >= 7 && (
                    <motion.div variants={chatBubble} initial="hidden" animate="visible" className="iphone-bubble-wrapper bot" style={{ originX: 0, originY: 1 }}>
                      <div style={{ width: 28, flexShrink: 0 }}></div>
                      <div className="iphone-bubble">Losa AI giải quyết được triệt để vấn đề này ạ!</div>
                    </motion.div>
                  )}

                  {visibleCount >= 8 && (
                    <motion.div variants={chatBubble} initial="hidden" animate="visible" className="iphone-bubble-wrapper bot" style={{ originX: 0, originY: 1 }}>
                      <img src="https://res.cloudinary.com/e1d8bnbg/image/upload/v1784799281/logo_blog_qd9i4n.png" className="iphone-avatar" alt="Bot" />
                      <div className="iphone-bubble">Trợ lý AI có thể trực page và chốt đơn 24/7.</div>
                    </motion.div>
                  )}

                  {visibleCount >= 9 && (
                    <motion.div variants={chatBubble} initial="hidden" animate="visible" className="iphone-bubble-wrapper user" style={{ originX: 1, originY: 1 }}>
                      <div className="iphone-bubble">Trả lời có bị máy móc quá không bạn?</div>
                    </motion.div>
                  )}

                  {visibleCount >= 10 && (
                    <motion.div variants={chatBubble} initial="hidden" animate="visible" className="iphone-bubble-wrapper user" style={{ originX: 1, originY: 1 }}>
                      <div className="iphone-bubble">Mình sợ khách đọc biết là bot.</div>
                    </motion.div>
                  )}

                  {visibleCount >= 11 && (
                    <motion.div variants={chatBubble} initial="hidden" animate="visible" className="iphone-bubble-wrapper bot" style={{ originX: 0, originY: 1 }}>
                      <div style={{ width: 28, flexShrink: 0 }}></div>
                      <div className="iphone-bubble">Hoàn toàn yên tâm ạ!</div>
                    </motion.div>
                  )}

                  {visibleCount >= 12 && (
                    <motion.div variants={chatBubble} initial="hidden" animate="visible" className="iphone-bubble-wrapper bot" style={{ originX: 0, originY: 1 }}>
                      <img src="https://res.cloudinary.com/e1d8bnbg/image/upload/v1784799281/logo_blog_qd9i4n.png" className="iphone-avatar" alt="Bot" />
                      <div className="iphone-bubble">AI bên em sử dụng ngôn ngữ tự nhiên như người thật.</div>
                    </motion.div>
                  )}

                  {visibleCount >= 13 && (
                    <motion.div variants={chatBubble} initial="hidden" animate="visible" className="iphone-bubble-wrapper user" style={{ originX: 1, originY: 1 }}>
                      <div className="iphone-bubble">Bot có biết tư vấn sản phẩm không?</div>
                    </motion.div>
                  )}

                  {visibleCount >= 14 && (
                    <motion.div variants={chatBubble} initial="hidden" animate="visible" className="iphone-bubble-wrapper user" style={{ originX: 1, originY: 1 }}>
                      <div className="iphone-bubble">Hay chỉ biết xin số điện thoại?</div>
                    </motion.div>
                  )}

                  {visibleCount >= 15 && (
                    <motion.div variants={chatBubble} initial="hidden" animate="visible" className="iphone-bubble-wrapper bot" style={{ originX: 0, originY: 1 }}>
                      <div style={{ width: 28, flexShrink: 0 }}></div>
                      <div className="iphone-bubble">Dạ AI sẽ được đào tạo bằng dữ liệu riêng của shop.</div>
                    </motion.div>
                  )}

                  {visibleCount >= 16 && (
                    <motion.div variants={chatBubble} initial="hidden" animate="visible" className="iphone-bubble-wrapper bot" style={{ originX: 0, originY: 1 }}>
                      <img src="https://res.cloudinary.com/e1d8bnbg/image/upload/v1784799281/logo_blog_qd9i4n.png" className="iphone-avatar" alt="Bot" />
                      <div className="iphone-bubble">Nên có thể hiểu sâu về sản phẩm để tư vấn chốt sale luôn ạ!</div>
                    </motion.div>
                  )}
                </div>
              </div>

              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#fff', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, borderTop: '1px solid #E5E7EB' }}>
                <div style={{ background: '#F3F4F6', padding: '10px 16px', borderRadius: 99, flex: 1, color: '#9CA3AF', fontSize: 13 }}>Nhập tin nhắn...</div>
                <Camera size={20} color="#0070F3" />
                <Mic size={20} color="#0070F3" />
                <Send size={20} color="#0070F3" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* PROBLEMS SECTION */}
      <section className="saas-section gray">
        <div className="saas-container">
          <div className="saas-section-header">
            <h2>Doanh nghiệp của bạn đang gặp phải những vấn đề này?</h2>
          </div>
          <motion.div className="saas-grid-5" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger}>
            {[
              { icon: <MessagesSquare size={32} color="#6366F1" />, title: 'Khách nhắn tin quá nhiều', desc: 'Không thể trả lời hết tất cả khách hàng.' },
              { icon: <Hourglass size={32} color="#3B82F6" />, title: 'Nhân viên trả lời chậm', desc: 'Khách phải chờ lâu và dễ bị mất khách.' },
              { icon: <UserRoundCheck size={32} color="#8B5CF6" />, title: 'Bỏ sót khách hàng', desc: 'Không quản lý được tin nhắn trên nhiều kênh.' },
              { icon: <Database size={32} color="#A855F7" />, title: 'Khó quản lý dữ liệu', desc: 'Thông tin khách hàng bị thất lạc, phân tán.' },
              { icon: <RefreshCcw size={32} color="#22C55E" />, title: 'Không chăm sóc lại khách cũ', desc: 'Khách có thể mua ở nơi chăm sóc, bỏ lỡ cơ hội bán hàng.' }
            ].map((p, i) => (
              <motion.div key={i} className="saas-card" style={{ textAlign: 'center', padding: '32px 20px', borderRadius: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }} variants={fadeUp}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                  <div style={{ background: '#EFF6FF', width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{p.icon}</div>
                </div>
                <h3 style={{ fontSize: 16, marginBottom: 12, lineHeight: 1.4 }}>{p.title}</h3>
                <p style={{ fontSize: 14, color: '#6B7280', margin: 0, lineHeight: 1.5 }}>{p.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="saas-section">
        <div className="saas-container">
          <div className="saas-section-header">
            <h2>Chatbot AI có thể giúp gì cho doanh nghiệp?</h2>
          </div>
          <motion.div className="saas-grid-3" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger}>
            {[
              { icon: <Headset size={32} color="#2563EB" />, title: 'Hỗ trợ 24/7', desc: 'Trả lời tức thì mọi lúc, mọi nơi, không bỏ sót khách.' },
              { icon: <Brain size={32} color="#4F46E5" />, title: 'AI Thông minh', desc: 'Hiểu ngữ cảnh, đưa ra câu trả lời chính xác.' },
              { icon: <Share2 size={32} color="#3B82F6" />, title: 'Tích hợp đa kênh', desc: 'Đồng bộ tin nhắn Facebook, Zalo, Website.' },
              { icon: <Users size={32} color="#2563EB" />, title: 'Quản lý khách hàng', desc: 'Lưu trữ thông tin, phân loại khách hàng tự động.' },
              { icon: <Bot size={32} color="#3B82F6" />, title: 'Tự động hóa', desc: 'Tự động lên đơn, nhắc lịch, gửi tin khuyến mãi.' },
              { icon: <BarChart3 size={32} color="#2563EB" />, title: 'Báo cáo thống kê', desc: 'Theo dõi hiệu suất kinh doanh qua biểu đồ trực quan.' },
            ].map((f, i) => (
              <motion.div key={i} className="saas-card" variants={fadeUp}>
                <div className="saas-card-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* WORKFLOW SECTION */}
      <section className="saas-section gray">
        <div className="saas-container">
          <div className="saas-section-header">
            <h2>Chatbot có thể làm được gì?</h2>
          </div>
          <motion.div className="saas-grid-6" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            {[
              { icon: <MessageCircleMore size={32} color="#3B82F6" />, title: 'Tư vấn sản phẩm' },
              { icon: <FileText size={32} color="#22C55E" />, title: 'Báo giá tự động' },
              { icon: <ShoppingCart size={32} color="#22C55E" />, title: 'Chốt đơn hàng' },
              { icon: <ClipboardList size={32} color="#2563EB" />, title: 'Thu thập thông tin khách hàng' },
              { icon: <UserRoundCog size={32} color="#2563EB" />, title: 'Chuyển nhân viên hỗ trợ' },
              { icon: <HeartHandshake size={32} color="#EF4444" />, title: 'Chăm sóc sau bán' },
            ].map((step, i) => (
              <motion.div key={i} className="saas-step" variants={fadeUp}>
                <div className="saas-step-icon">{step.icon}</div>
                <h4 style={{fontSize: 14}}>{step.title}</h4>
                {i < 5 && <div className="saas-workflow-arrow"><ArrowRight size={18} color="#38BDF8" /></div>}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* MULTI-PLATFORM SUPPORT SECTION */}
      <section className="saas-section">
        <div className="saas-container">
          <div className="saas-section-header">
            <h2>Hỗ trợ trên nhiều nền tảng</h2>
          </div>
          <div className="logo-slider" style={{ marginTop: '32px' }}>
            <div className="logo-track">
              {[
                { icon: <FaFacebookMessenger size={32} color="#0084FF" />, title: 'Facebook Messenger' },
                { icon: <Globe size={32} color="#0EA5E9" />, title: 'Website' },
                { icon: <SiZalo size={32} color="#0068FF" />, title: 'Zalo OA' },
                { icon: <FaTelegramPlane size={32} color="#229ED9" />, title: 'Telegram' },
                { icon: <FaInstagram size={32} color="#E1306C" />, title: 'Instagram' },
                { icon: <FaWhatsapp size={32} color="#25D366" />, title: 'WhatsApp' },
                { icon: <FaFacebookMessenger size={32} color="#0084FF" />, title: 'Facebook Messenger' },
                { icon: <Globe size={32} color="#0EA5E9" />, title: 'Website' },
                { icon: <SiZalo size={32} color="#0068FF" />, title: 'Zalo OA' },
                { icon: <FaTelegramPlane size={32} color="#229ED9" />, title: 'Telegram' },
                { icon: <FaInstagram size={32} color="#E1306C" />, title: 'Instagram' },
                { icon: <FaWhatsapp size={32} color="#25D366" />, title: 'WhatsApp' },
              ].map((plat, i) => (
                <div key={i} className="saas-card" style={{ display: 'inline-flex', padding: '20px 16px', alignItems: 'center', justifyContent: 'center', gap: '12px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid #F1F5F9', minHeight: '80px', margin: '0 12px', width: '200px', whiteSpace: 'normal', verticalAlign: 'middle', cursor: 'pointer' }}>
                  <div style={{display: 'flex', alignItems: 'center'}} className="saas-platform-icon-inline">{plat.icon}</div>
                  <h4 style={{fontSize: 14, fontWeight: 700, margin: 0, color: 'var(--saas-blue)', lineHeight: 1.3, textAlign: 'left', flex: 1}}>
                    {plat.title.split(' ').map((word, idx) => <span key={idx} style={{display: 'block'}}>{word}</span>)}
                  </h4>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* IMPLEMENTATION PROCESS */}
      <section className="saas-section gray">
        <div className="saas-container">
          <div className="saas-section-header">
            <h2>Quy trình triển khai</h2>
          </div>
          <motion.div className="saas-grid-6" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            {[
              { icon: <MessageSquareMore size={32} color="#2563EB" />, title: 'Tiếp nhận yêu cầu' },
              { icon: <SearchCheck size={32} color="#2563EB" />, title: 'Phân tích nghiệp vụ' },
              { icon: <PencilRuler size={32} color="#2563EB" />, title: 'Thiết kế chatbot' },
              { icon: <Rocket size={32} color="#2563EB" />, title: 'Triển khai' },
              { icon: <ShieldCheck size={32} color="#2563EB" />, title: 'Kiểm thử' },
              { icon: <Handshake size={32} color="#2563EB" />, title: 'Bàn giao & hỗ trợ' },
            ].map((step, i) => (
              <motion.div key={i} className="saas-step" variants={fadeUp}>
                <div className="saas-step-icon">{step.icon}</div>
                <h4 style={{fontSize: 14}}>{step.title}</h4>
                {i < 5 && <div className="saas-workflow-arrow"><ArrowRight size={18} color="#2563EB" /></div>}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CALL TO ACTION (Replaces Pricing) */}
      <section className="saas-section">
        <div className="saas-container">
          <motion.div className="saas-contact-box" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: 600, margin: '0 auto' }}>
              <h2 style={{ fontSize: 36, marginBottom: 16, color: 'white' }}>Sẵn sàng tự động hóa doanh nghiệp?</h2>
              <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.8)', marginBottom: 32 }}>
                Chúng tôi cung cấp các gói dịch vụ Chatbot AI linh hoạt, phù hợp với mọi quy mô từ cửa hàng nhỏ đến doanh nghiệp lớn.
              </p>
              <Link to="/dich-vu" className="saas-btn" style={{ background: 'white', color: 'var(--saas-primary)', fontSize: 18 }}>
                Xem chi tiết các gói dịch vụ
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CASE STUDY SECTION */}
      <section className="saas-section gray">
        <div className="saas-container">
          <div className="saas-section-header">
            <h2>Hiệu quả thực tế</h2>
          </div>
          <motion.div className="saas-grid-3" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div className="saas-card" style={{ textAlign: 'center' }} variants={fadeUp}>
              <div className="saas-stat-num" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Users size={32} style={{ marginRight: 8, color: 'var(--saas-primary)' }} /> <CountUpAnimation initialValue={200} targetValue={300} textAfter="+" /></div>
              <h3>Khách hàng sử dụng</h3>
              <p>Đã triển khai thành công</p>
            </motion.div>
            <motion.div className="saas-card" style={{ textAlign: 'center' }} variants={fadeUp}>
              <div className="saas-stat-num" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}><TrendingUp size={32} style={{ marginRight: 8, color: '#10B981' }} /> -70%</div>
              <h3>Nhân sự tư vấn</h3>
              <p>Tiết kiệm chi phí vận hành</p>
            </motion.div>
            <motion.div className="saas-card" style={{ textAlign: 'center' }} variants={fadeUp}>
              <div className="saas-stat-num" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}><BarChart3 size={32} style={{ marginRight: 8, color: '#F59E0B' }} /> +35%</div>
              <h3>Doanh thu</h3>
              <p>Tăng tỷ lệ chốt đơn tự động</p>
            </motion.div>
          </motion.div>
        </div>
      </section>



      {/* FAQ SECTION */}
      <section className="saas-section gray">
        <div className="saas-container" style={{ maxWidth: 800 }}>
          <div className="saas-section-header">
            <h2>Câu hỏi thường gặp</h2>
          </div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <Collapse
              size="large"
              accordion
              expandIcon={({ isActive }) => isActive ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              style={{ background: 'white', borderRadius: 16 }}
              items={homeFaqs.length > 0 ? homeFaqs.map(f => ({ key: f._id, label: <b>{f.question}</b>, children: <p style={{ whiteSpace: 'pre-wrap' }}>{f.answer}</p> })) : [
                { key: 'empty', label: <b>Chưa có câu hỏi</b>, children: <p>Nội dung đang được cập nhật.</p> }
              ]}
            />
          </motion.div>
        </div>
      </section>

      {/* BLOG SECTION */}
      <section className="saas-section">
        <div className="saas-container">
          <div className="saas-section-header space-between" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', textAlign: 'left', marginBottom: 40 }}>
            <div style={{ margin: 0 }}>
              <h2 style={{ marginBottom: 8 }}>Bài viết mới nhất</h2>
              <p style={{ margin: 0 }}>Cập nhật kiến thức AI và Automation</p>
            </div>
            <Link to="/blog" style={{ color: 'var(--saas-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>Xem tất cả <ArrowRight size={16} /></Link>
          </div>

          {blogsQ.loading ? (
            <div className="saas-grid-3">
              {[1, 2, 3].map(i => <div className="saas-card" key={i}><Skeleton active paragraph={{ rows: 3 }} /></div>)}
            </div>
          ) : (
            <motion.div className="saas-grid-3" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
              {blogs.map((b, i) => (
                <motion.div key={b._id} variants={fadeUp} style={{ height: '100%' }}>
                  <Link className="saas-blog-card" to={`/blog/${b.slug || b._id}`}>
                    <div className="saas-blog-img-wrapper">
                      <img src={b.coverImageUrl || 'https://res.cloudinary.com/e1d8bnbg/image/upload/v1784799281/logo_blog_qd9i4n.png'} alt={b.title} className="saas-blog-img" />
                    </div>
                    <div className="saas-blog-content">
                      <Tag color="blue" style={{ alignSelf: 'flex-start', marginBottom: 12, borderRadius: 12, border: 0, display: 'flex', alignItems: 'center' }}>
                        <LucideTag size={12} style={{ marginRight: 4 }} /> {b.category?.name || b.category || 'Blog'}
                      </Tag>
                      <h3>{b.title}</h3>
                      <div className="saas-blog-meta" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Calendar size={14} /> {formatDate(b.publishedAt || b.createdAt)}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>


    </div>
  )
}


// ---- Blog -----------------------------------------------------------------
