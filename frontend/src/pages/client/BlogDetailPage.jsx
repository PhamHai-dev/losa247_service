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

export function BlogDetailPage() {
  const { id } = useParams()
  const query = useApiQuery(() => publicBlogsService.getBySlug(id), [id])
  const blog = query.data

  const relatedQuery = useApiQuery(() => id && blog && blog._id ? publicBlogsService.getRelated(id) : Promise.resolve([]), [id, blog?._id])
  const relatedBlogs = relatedQuery.data || []

  const contentRef = useRef(null)
  const [toc, setToc] = useState([])
  const [showToc, setShowToc] = useState(true)
  const [activeId, setActiveId] = useState('')

  useEffect(() => {
    if (!id) return;
    const key = 'viewed_blog_' + id;
    if (!sessionStorage.getItem(key)) {
      publicBlogsService.recordView(id).catch(() => { })
      sessionStorage.setItem(key, '1')
    }
  }, [id])

  useEffect(() => {
    if (blog?.content && contentRef.current) {
      setTimeout(() => {
        if (!contentRef.current) return;
        const headings = contentRef.current.querySelectorAll('h1, h2, h3, h4, h5, h6');
        const tocList = [];
        headings.forEach((h, i) => {
          if (!h.id) h.id = `heading-${i}`;
          tocList.push({
            id: h.id,
            index: i,
            text: h.innerText || h.textContent,
            level: parseInt(h.tagName.substring(1))
          });
        });
        setToc(tocList);
      }, 100);
    }
  }, [blog?.content]);

  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current || toc.length === 0) return;
      const headings = Array.from(contentRef.current.querySelectorAll('h1, h2, h3, h4, h5, h6'));
      if (headings.length === 0) return;

      let currentActiveId = toc[0].id;
      for (let i = 0; i < headings.length; i++) {
        const h = headings[i];
        if (h.getBoundingClientRect().top <= 200) {
          if (toc[i]) {
            currentActiveId = toc[i].id;
          }
        }
      }
      setActiveId(currentActiveId);
    };

    window.addEventListener('scroll', handleScroll, true);
    setTimeout(handleScroll, 300);

    return () => window.removeEventListener('scroll', handleScroll, true);
  }, [toc]);

  const hasHeadings = blog?.content && blog?.showToc !== false ? /<h[1-6]/i.test(blog.content) : false;

  return (
    <main className="section" style={{ background: '#F7F9FC', minHeight: '100vh', paddingBottom: 60 }}><div className="container">
      <Spin spinning={query.loading}>
        {!blog && !query.loading ? <Empty description="Không tìm thấy bài viết" /> : blog && (
          <div style={{
            paddingTop: '40px',
            width: '100%',
            transition: 'max-width 0.5s ease-in-out'
          }}>
            {!showToc && hasHeadings && (
              <div
                style={{
                  position: 'fixed', right: 24, top: 100, zIndex: 100,
                  background: '#fff', padding: 12, borderRadius: 12,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)', border: '1px solid var(--line)'
                }}
                title="Hiện nội dung chính"
              >
                <MenuOutlined style={{ fontSize: 24, cursor: 'pointer', color: 'var(--primary)' }} onClick={() => setShowToc(true)} />
              </div>
            )}

            <div style={{ marginBottom: 32, maxWidth: (showToc && hasHeadings) ? 'calc(100% - 340px)' : '100%' }}>
              {blog.category && <span style={{ color: 'var(--primary)', fontWeight: 600, fontSize: 14 }}>{blog.category?.name || (typeof blog.category === 'string' ? 'Danh mục' : 'Danh mục')}</span>}
              <h1 style={{ fontSize: 'clamp(28px, 5vw, 42px)', margin: '16px 0', lineHeight: 1.3 }}>{blog.title}</h1>
              <div className="blog-meta">
                <span><CalendarOutlined /> {formatDate(blog.publishedAt)}</span>
                <span><EyeOutlined /> {blog.views || 0} lượt xem</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 80, alignItems: 'flex-start' }}>
              <div style={{ flex: 1, minWidth: 0, width: '100%' }}>
                {blog.coverImageUrl && (
                  <img src={blog.coverImageUrl} alt={blog.title} style={{ width: '100%', borderRadius: 24, marginBottom: 40 }} />
                )}
                <div className="blog-content" ref={contentRef} dangerouslySetInnerHTML={{ __html: blog.content }} />

                {blog.tags && blog.tags.length > 0 && (
                  <div style={{ marginTop: 40, paddingTop: 20, borderTop: '1px solid var(--line)' }}>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                      {blog.tags.map(t => t && t._id ? (
                        <Tag key={t._id} color="geekblue" style={{ padding: '6px 16px', fontSize: 14, borderRadius: 100, border: '1px solid #adc6ff', background: '#f0f5ff', fontWeight: 500 }}>
                          {t.name}
                        </Tag>
                      ) : null)}
                    </div>
                  </div>
                )}

                {relatedBlogs.length > 0 && (
                  <div style={{ marginTop: 60 }}>
                    <h3 style={{ marginBottom: 24, fontSize: 24 }}>Bài viết liên quan</h3>
                    <div className="main-blog-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
                      {relatedBlogs.map(b => (
                        <Link to={`/blog/${b.slug}`} key={b._id} className="blog-card">
                          <img src={b.coverImageUrl || '/placeholder.jpg'} alt={b.title} className="blog-card-img" />
                          <div className="blog-card-body">
                            {b.category && <span className="card-cat">{b.category.name}</span>}
                            <h3>{b.title}</h3>
                            <div className="blog-meta">
                              <span>{formatDate(b.publishedAt)}</span>
                              <span>•</span>
                              <span><EyeOutlined /> {b.views || 0}</span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div style={{
                position: 'sticky', top: 100,
                width: showToc && hasHeadings ? 300 : 0,
                opacity: showToc && hasHeadings ? 1 : 0,
                overflow: 'hidden',
                flexShrink: 0,
                transition: 'all 0.5s ease-in-out'
              }}>
                {hasHeadings && (
                  <div className="toc-widget" style={{
                    background: '#f8fafc',
                    padding: 24,
                    borderRadius: 16,
                    border: '1px solid var(--line)',
                    width: 300
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                      <h3 style={{ margin: 0, fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <MenuOutlined /> Nội dung chính
                      </h3>
                      <span
                        style={{ color: 'var(--primary)', cursor: 'pointer', fontSize: 14 }}
                        onClick={() => setShowToc(false)}
                      >
                        [Ẩn]
                      </span>
                    </div>
                    <div className="toc-list" style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
                      {toc.map(item => (
                        <div key={item.id} style={{ paddingLeft: (item.level - 2) * 16 }}>
                          <a
                            href={`#${item.id}`}
                            onClick={(e) => {
                              e.preventDefault();
                              if (!contentRef.current) return;
                              const headings = contentRef.current.querySelectorAll('h2, h3, h4');
                              const el = headings[item.index];
                              if (el) {
                                const y = el.getBoundingClientRect().top + window.scrollY - 100;
                                window.scrollTo({ top: y, behavior: 'smooth' });
                              }
                            }}
                            className={`toc-link level-${item.level} ${activeId === item.id ? 'active' : ''}`}
                            style={{
                              color: activeId === item.id ? '#16a34a' : (item.level === 2 ? '#0f172a' : '#475569'),
                              fontWeight: activeId === item.id ? 700 : (item.level === 2 ? 600 : 400),
                              textDecoration: 'none',
                              fontSize: 14,
                              display: 'block',
                              lineHeight: 1.4
                            }}
                          >
                            {item.text}
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Spin>
    </div></main>
  )
}


// ---- Tag Detail -------------------------------------------------------------
