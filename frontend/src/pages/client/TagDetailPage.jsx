import { CountUpAnimation } from '../../components/ui/CountUpAnimation';
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
import { publicBlogsService } from '../../features/blogs/blogsService'
import { publicFaqsService } from '../../features/faqs/faqsService'
import { publicPricingService } from '../../features/services/pricingService'
import { leadsService } from '../../features/leads/leadsService'
import { useUIStore } from '../../stores/uiStore'
import { useAuthStore } from '../../stores/authStore'
import { useDebounce } from '../../hooks/useDebounce'

// ---- Components -------------------------------------------------------------

export function TagDetailPage() {
  const { slug } = useParams();
  const [page, setPage] = useState(1);

  const tagsQuery = useApiQuery(() => publicBlogsService.getTags(), []);
  const tagObj = tagsQuery.data?.find(t => t.slug === slug);

  const mainListQuery = useApiQuery(
    () => tagObj ? publicBlogsService.getList({ page, limit: 12, tag: tagObj._id }) : Promise.resolve({ items: [], pagination: { total: 0 } }),
    [page, tagObj?._id]
  );

  const blogs = mainListQuery.data?.items || [];
  const total = mainListQuery.data?.pagination?.total || 0;

  return (
    <main className="blog-page-container">
      <div className="container">
        <div className="blog-header" style={{ textAlign: 'center', display: 'block', marginBottom: 60 }}>
          <h1 style={{ fontSize: 42, color: 'var(--navy)', marginBottom: 16 }}>
            Bài viết theo thẻ: <span style={{ color: 'var(--orange)' }}>#{tagObj?.name || slug}</span>
          </h1>
          <p style={{ color: '#64748b', fontSize: 16 }}>Khám phá các bài viết thuộc chủ đề này</p>
        </div>

        <Spin spinning={mainListQuery.loading || tagsQuery.loading}>
          {!blogs.length ? (
            <Empty description="Không tìm thấy bài viết nào" style={{ margin: '80px 0' }} />
          ) : (
            <>
              <div className="main-blog-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                {blogs.map(b => (
                  <Link to={`/blog/${b.slug}`} key={b._id} className="blog-card">
                    <img src={b.coverImageUrl || '/placeholder.jpg'} alt={b.title} className="blog-card-img" />
                    <div className="blog-card-body">
                      {b.category && (
                        <span className="card-cat">{b.category.name}</span>
                      )}
                      <h3>{b.title}</h3>
                      <p className="card-excerpt">{b.excerpt || b.metaDescription}</p>
                      <div className="blog-meta">
                        <span>{formatDate(b.publishedAt)}</span>
                        <span>•</span>
                        <span><EyeOutlined /> {b.views || 0}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {total > 0 && (
                <div className="pagination-wrapper">
                  <Pagination current={page} total={total} pageSize={12} onChange={(p) => setPage(p)} showSizeChanger={false} hideOnSinglePage={false} />
                </div>
              )}
            </>
          )}
        </Spin>
      </div>
    </main>
  );
}
