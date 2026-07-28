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

export function CountUpAnimation({ initialValue, targetValue, textAfter = "" }) {
  const [count, setCount] = useState(initialValue);
  const nodeRef = useRef(null);

  useEffect(() => {
    let startTime;
    const duration = 2000; // 2 seconds

    const updateCount = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      const easeProgress = percentage === 1 ? 1 : 1 - Math.pow(2, -10 * percentage);
      const current = Math.floor(initialValue + (targetValue - initialValue) * easeProgress);
      setCount(current);

      if (progress < duration) {
        requestAnimationFrame(updateCount);
      } else {
        setCount(targetValue);
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          requestAnimationFrame(updateCount);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (nodeRef.current) {
      observer.observe(nodeRef.current);
    }

    return () => observer.disconnect();
  }, [initialValue, targetValue]);

  return <span ref={nodeRef}>{count}{textAfter}</span>;
}

