import { CountUpAnimation } from '../../components/ui/CountUpAnimation';
import { useState, useEffect, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
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

import { useI18n } from '../../hooks/useI18n'
import { PageSeo } from '../../components/seo/PageSeo'

// ---- Components -------------------------------------------------------------

function TocPanel({ toc, activeId, showToc, setShowToc, contentRef, t, locale, mobile = false }) {
  const goToHeading = (event, item) => {
    event.preventDefault()
    const headings = Array.from(contentRef.current?.querySelectorAll('h1, h2, h3, h4, h5, h6') || [])
    const element = contentRef.current?.querySelector(`[id="${item.id}"]`) || headings[item.index]
    if (!element) return

    const headerHeight = document.querySelector('.client-header')?.getBoundingClientRect().height || 78
    window.scrollTo({ top: element.getBoundingClientRect().top + window.scrollY - headerHeight - 12, behavior: 'smooth' })
    if (mobile) window.setTimeout(() => setShowToc(false), 120)
  }

  return (
    <section id={mobile ? 'blog-mobile-toc' : 'blog-desktop-toc'} className={`toc-widget${mobile ? ' toc-widget--mobile' : ''}${showToc ? ' is-open' : ''}`} aria-label={t('blog.toc')} onClick={mobile ? event => event.stopPropagation() : undefined}>
      <div className="toc-widget__header">
        <span className="toc-widget__title"><MenuOutlined /> {t('blog.toc')}</span>
        <button type="button" className="toc-widget__trigger" aria-label={showToc ? (locale === 'en' ? 'Hide table of contents' : 'Ẩn mục lục') : (locale === 'en' ? 'Show table of contents' : 'Hiện mục lục')} aria-expanded={showToc} aria-controls={mobile ? 'blog-mobile-toc-list' : 'blog-desktop-toc-list'} onClick={() => setShowToc(!showToc)}><ChevronDown /></button>
      </div>
      <div id={mobile ? 'blog-mobile-toc-list' : 'blog-desktop-toc-list'} className="toc-list">
        {toc.map(item => <a key={item.id} href={`#${item.id}`} onClick={event => goToHeading(event, item)} className={`toc-link level-${item.level} ${activeId === item.id ? 'active' : ''}`}>{item.text}</a>)}
      </div>
    </section>
  )
}

export function BlogDetailPage() {
  const { locale, t, localizedPath } = useI18n()
  const { id } = useParams()
  const blogPath = (slug) => localizedPath(`/blog/${slug}`)
  const query = useApiQuery(() => publicBlogsService.getBySlug(id, locale), [id, locale])
  const blog = query.data

  const relatedQuery = useApiQuery(() => id && blog?._id ? publicBlogsService.getRelated(id, locale) : Promise.resolve([]), [id, blog?._id, locale])
  const relatedBlogs = relatedQuery.data || []

  const contentRef = useRef(null)
  const [toc, setToc] = useState([])
  const [showToc, setShowToc] = useState(() => window.matchMedia('(min-width: 769px)').matches)
  const [activeId, setActiveId] = useState('')

  useEffect(() => {
    const media = window.matchMedia('(min-width: 769px)')
    const syncTocVisibility = event => setShowToc(event.matches)
    media.addEventListener('change', syncTocVisibility)
    return () => media.removeEventListener('change', syncTocVisibility)
  }, [])

  useEffect(() => {
    if (!id) return;
    const key = `viewed_blog_${locale}_${id}`;
    if (!sessionStorage.getItem(key)) {
      publicBlogsService.recordView(id, locale).catch(() => { })
      sessionStorage.setItem(key, '1')
    }
  }, [id, locale])


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
      {blog && <PageSeo title={blog.metaTitle || blog.title} description={blog.metaDescription || blog.excerpt} image={blog.coverImageUrl} isFallback={blog.isFallback} alternates={blog.alternates} />}
      <Spin spinning={query.loading}>
        {!blog && !query.loading ? <Empty description={t('blog.notFound')} /> : blog && (
          <div className="blog-detail" data-toc-open={showToc && hasHeadings}>
            {!showToc && blog.content && (
              <button type="button" className="blog-detail__toc-fab" aria-label={locale === 'en' ? 'Show table of contents' : 'Hiện mục lục'} aria-expanded="false" onClick={() => setShowToc(true)}><ChevronLeft /></button>
            )}
            {showToc && hasHeadings && (
              <div className="blog-detail__toc-overlay" onClick={() => setShowToc(false)}>
                <TocPanel toc={toc} activeId={activeId} showToc={showToc} setShowToc={setShowToc} contentRef={contentRef} t={t} locale={locale} mobile />
              </div>
            )}

            <header className="blog-detail__header">
              {blog.category && <span className="blog-detail__category">{blog.category?.name || (locale === 'en' ? 'Category' : 'Danh mục')}</span>}
              <h1>{blog.title}</h1>
              <div className="blog-meta blog-detail__meta">
                <span><CalendarOutlined /> {formatDate(blog.publishedAt)}</span>
                <span><EyeOutlined /> {blog.views || 0} {t('blog.views')}</span>
              </div>
            </header>

            <div className="blog-detail__layout">
              <article className="blog-detail__article">
                {blog.coverImageUrl && <img src={blog.coverImageUrl} alt={blog.title} className="blog-detail__cover" />}
                <div className="blog-content" ref={contentRef} dangerouslySetInnerHTML={{ __html: blog.content }} />

                {blog.tags?.length > 0 && <div className="blog-detail__tags">{blog.tags.map(tag => tag?._id ? <Tag key={tag._id} color="geekblue">{tag.name}</Tag> : null)}</div>}
                {relatedBlogs.length > 0 && <div className="blog-detail__related"><h3>{t('blog.related')}</h3><div className="main-blog-grid">{relatedBlogs.map(b => <Link to={blogPath(b.slug)} key={b._id} className="blog-card"><img src={b.coverImageUrl || '/placeholder.jpg'} alt={b.title} className="blog-card-img" /><div className="blog-card-body">{b.category && <span className="card-cat">{b.category.name}</span>}<h3>{b.title}</h3><div className="blog-meta"><span>{formatDate(b.publishedAt)}</span><span>•</span><span><EyeOutlined /> {b.views || 0}</span></div></div></Link>)}</div></div>}
              </article>
              {hasHeadings && <aside className="blog-detail__toc-sidebar"><TocPanel toc={toc} activeId={activeId} showToc={showToc} setShowToc={setShowToc} contentRef={contentRef} t={t} locale={locale} /></aside>}
            </div>
          </div>
        )}
      </Spin>
    </div></main>
  )
}


// ---- Tag Detail -------------------------------------------------------------
