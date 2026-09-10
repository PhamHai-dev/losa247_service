import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight, BarChart3, Bot, Calendar, CheckCircle2, ChevronDown, ChevronUp,
  CircleCheck, Clock3, Headset, MessageCircleMore,
  Sparkles, Star, Workflow
} from 'lucide-react'
import { FaFacebookMessenger, FaInstagram, FaTelegramPlane, FaWhatsapp } from 'react-icons/fa'
import { SiZalo } from 'react-icons/si'
import { Empty } from 'antd'
import { motion } from 'framer-motion'
import { useApiQuery } from '../../hooks/useApiQuery'
import { formatDate } from '../../utils/format'
import { publicBlogsService } from '../../features/blogs/blogsService'
import { publicFaqsService } from '../../features/faqs/faqsService'
import { useUIStore } from '../../stores/uiStore'
import { ClientFaqSection } from '../../components/client/ClientFaqSection'
import { useI18n } from '../../hooks/useI18n'
import { PageSeo } from '../../components/seo/PageSeo'

const BLOG_FALLBACK = `${(import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1').replace(/\/api\/v1\/?$/, '')}/uploads/images/blog-image/blog-fallback.png`

const fadeUp = {
  hidden: { opacity: 0, y: 26 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55 } }
}

const stagger = { visible: { transition: { staggerChildren: 0.12 } } }

export function HomePage() {
  const [activeBlogCategory, setActiveBlogCategory] = useState(null)
  const openLeadModal = useUIStore((state) => state.openLeadModal)
  const { locale, t, localizedPath } = useI18n()
  const en = locale === 'en'
  const whyItems = en ? [
    { icon: <Clock3 />, value: '24/7', title: 'Never miss a customer', text: 'Respond and support continuously, even outside business hours.' },
    { icon: <MessageCircleMore />, value: 'Omnichannel', title: 'One conversation stream', text: 'Connect Website, Zalo, Messenger and other popular channels.' },
    { icon: <BarChart3 />, value: 'Centralized', title: 'Data on one platform', text: 'Manage customers and operational performance in one place.' },
    { icon: <Bot />, value: 'AI', title: 'Intelligent automation', text: 'Reduce repetitive work so your team can focus on conversion.' },
    { icon: <Workflow />, value: 'Flexible', title: 'Designed for your workflow', text: 'Customize processes for each business model and growth stage.' },
  ] : [
    { icon: <Clock3 />, value: '24/7', title: 'Không bỏ lỡ khách hàng', text: 'Phản hồi và chăm sóc liên tục, kể cả ngoài giờ làm việc.' },
    { icon: <MessageCircleMore />, value: 'Đa kênh', title: 'Một luồng hội thoại', text: 'Kết nối Website, Zalo, Messenger và các kênh phổ biến.' },
    { icon: <BarChart3 />, value: 'Tập trung', title: 'Dữ liệu trên một nền tảng', text: 'Quản lý khách hàng và hiệu quả vận hành tại một nơi duy nhất.' },
    { icon: <Bot />, value: 'AI', title: 'Tự động hóa thông minh', text: 'Giảm tác vụ lặp lại để đội ngũ tập trung vào chuyển đổi.' },
    { icon: <Workflow />, value: 'Linh hoạt', title: 'Thiết kế theo nghiệp vụ', text: 'Tùy chỉnh quy trình phù hợp từng mô hình và giai đoạn tăng trưởng.' },
  ]
  const solutions = en ? [
    { title: 'AI Chatbot Solution', text: 'Advise, support and sell 24/7 across channels with a context-aware chatbot trained on your own data.', to: '/giai-phap/chatbot', icon: <Bot />, accent: 'blue', tags: ['24/7 consulting', 'Omnichannel', 'Context-aware'] },
    { title: 'CRM Solution', text: 'Centralize customer data, track sales opportunities and automate customer care in one system.', to: '/giai-phap/crm', icon: <BarChart3 />, accent: 'violet', tags: ['Centralized data', 'Opportunity management', 'Automated care'] },
  ] : [
    { title: 'Giải pháp Chatbot AI', text: 'Tư vấn, chăm sóc và hỗ trợ bán hàng 24/7 trên nhiều kênh. Chatbot hiểu ngữ cảnh và được đào tạo theo dữ liệu riêng.', to: '/giai-phap/chatbot', icon: <Bot />, accent: 'blue', tags: ['Tư vấn 24/7', 'Đa kênh', 'Hiểu ngữ cảnh'] },
    { title: 'Giải pháp CRM', text: 'Quản lý khách hàng tập trung, theo dõi cơ hội bán hàng và tự động hóa quy trình chăm sóc trên một hệ thống duy nhất.', to: '/giai-phap/crm', icon: <BarChart3 />, accent: 'violet', tags: ['Dữ liệu tập trung', 'Quản lý cơ hội', 'Tự động chăm sóc'] },
  ]

  const blogCategoriesQ = useApiQuery(() => publicBlogsService.getCategories(locale), [locale])
  const blogsQ = useApiQuery(
    () => publicBlogsService.getList({ limit: 5, category: activeBlogCategory || undefined }, locale),
    [activeBlogCategory, locale]
  )
  const faqsQ = useApiQuery(() => publicFaqsService.getList({ pageType: 'home' }, locale), [locale])

  const blogCategories = blogCategoriesQ.data || []
  const blogs = blogsQ.data?.items || []
  const featuredBlog = blogs.find((blog) => blog.isFeatured) || blogs[0]
  const sideBlogs = featuredBlog ? blogs.filter((blog) => blog._id !== featuredBlog._id).slice(0, 4) : []
  const homeFaqs = faqsQ.data?.items || []

  return (
    <main className="client-app-wrapper home-page">
      <PageSeo title={t('home.title')} description={t('seo.defaultDescription')} />
      <section className="client-hero" aria-labelledby="home-hero-title">
        <div className="saas-container client-hero__grid">
          <motion.div className="client-hero__content" initial="hidden" animate="visible" variants={stagger}>
            <motion.span className="client-hero__badge" variants={fadeUp}><Star size={14} fill="currentColor" /> {en ? 'Trusted by more than 200 businesses' : 'Được tin dùng bởi hơn 200 doanh nghiệp'}</motion.span>
            <motion.h1 id="home-hero-title" className="client-hero__title" variants={fadeUp}>{en ? <>Operate smarter with the <span>Losa ecosystem</span></> : <>Vận hành thông minh hơn với <span>hệ sinh thái Losa</span></>}</motion.h1>
            <motion.p className="client-hero__lead" variants={fadeUp}>{en ? 'A digital transformation platform that automates sales, customer care and data management in one unified experience.' : 'Giải pháp chuyển đổi số giúp doanh nghiệp tự động hóa bán hàng, chăm sóc khách hàng và quản trị dữ liệu trên một nền tảng thống nhất.'}</motion.p>
            <motion.div className="client-hero__proof" variants={fadeUp}>
              <span><CircleCheck size={17} /> {en ? '24/7 consulting' : 'Tư vấn 24/7'}</span>
              <span><CircleCheck size={17} /> {en ? 'Omnichannel' : 'Kết nối đa kênh'}</span>
              <span><CircleCheck size={17} /> {en ? 'Workflow customization' : 'Tùy chỉnh theo nghiệp vụ'}</span>
            </motion.div>
            <motion.div className="client-hero__actions" variants={fadeUp}>
              <button id="home-hero-consultation-btn" type="button" className="saas-btn home-hero-secondary" onClick={openLeadModal}>{en ? 'Request a free consultation' : 'Đăng ký tư vấn miễn phí'}</button>
            </motion.div>
          </motion.div>

          <motion.div className="client-hero__visual home-hero-visual" initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <div className="home-hero-glow" />
            <img className="home-hero-main-image" src={`${(import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1').replace(/\/api\/v1\/?$/, '')}/uploads/images/logo-image/home-hero-main.png`} alt={en ? 'Losa digital transformation solution ecosystem' : 'Hệ sinh thái giải pháp chuyển đổi số Losa'} />
            <img className="home-hero-robot" src={`${(import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1').replace(/\/api\/v1\/?$/, '')}/uploads/images/logo-image/home-hero-bot.png`} alt={en ? 'Losa AI assistant' : 'Trợ lý AI Losa'} />
            <span className="home-hero-channel channel-messenger"><FaFacebookMessenger /></span>
            <span className="home-hero-channel channel-zalo"><SiZalo /></span>
            <span className="home-hero-channel channel-telegram"><FaTelegramPlane /></span>
            <span className="home-hero-channel channel-instagram"><FaInstagram /></span>
            <span className="home-hero-channel channel-whatsapp"><FaWhatsapp /></span>
          </motion.div>
        </div>
      </section>

      <section className="saas-section home-why" aria-labelledby="home-why-title">
        <div className="saas-container">
          <header className="home-section-heading">
            <span>{en ? 'Distinctive value' : 'Giá trị khác biệt'}</span>
            <h2 id="home-why-title">{en ? 'Why businesses choose Losa' : 'Vì sao doanh nghiệp chọn Losa?'}</h2>
            <p>{en ? 'Technology designed to deliver measurable operational results, not merely another chat tool.' : 'Công nghệ được thiết kế để tạo ra hiệu quả vận hành đo lường được, không chỉ dừng ở một công cụ trò chuyện.'}</p>
          </header>
          <motion.div className="home-why-grid" initial={false} animate="visible" variants={stagger}>
            {whyItems.map((item) => (
              <motion.article className="home-why-item" variants={fadeUp} key={item.title}>
                <span className="home-why-icon">{item.icon}</span>
                <div className="home-why-copy">
                  <strong>{item.value}</strong>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="saas-section home-ecosystem" id="ecosystem" aria-labelledby="ecosystem-title">
        <div className="saas-container">
          <header className="home-section-heading">
            <span>{en ? 'Comprehensive solutions' : 'Giải pháp toàn diện'}</span>
            <h2 id="ecosystem-title">{en ? 'The Losa ecosystem — Digital transformation for businesses' : 'Hệ sinh thái Losa – Giải pháp chuyển đổi số cho doanh nghiệp'}</h2>
            <p>{en ? 'Connect intelligent communications with centralized data management for seamless operations.' : 'Kết nối giao tiếp thông minh với quản trị dữ liệu tập trung để tạo nên một quy trình vận hành liền mạch.'}</p>
          </header>
          <div className="home-solution-grid">
            {solutions.map((solution) => (
              <article className={`home-solution-card ${solution.accent}`} key={solution.title}>
                <div className="home-solution-icon">{solution.icon}</div>
                <div className="home-solution-copy">
                  <span className="home-solution-kicker"><Sparkles size={14} /> {en ? 'Losa solution' : 'Giải pháp Losa'}</span>
                  <h3>{solution.title}</h3>
                  <p>{solution.text}</p>
                  <div className="home-solution-tags">{solution.tags.map((tag) => <span key={tag}><CheckCircle2 size={14} />{tag}</span>)}</div>
                  <Link id={`home-${solution.accent}-solution-link`} to={localizedPath(solution.to)}>{locale === 'en' ? 'Learn more' : 'Xem thêm'} <ArrowRight size={17} /></Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="saas-section home-insights-section" id="home-insights" aria-labelledby="home-insights-title">
        <div className="saas-container">
          <header className="home-insights-heading">
            <div><span className="home-insights-eyebrow">{en ? 'Insights & trends' : 'Kiến thức & xu hướng'}</span><h2 id="home-insights-title">{en ? 'Business insights' : 'Góc kiến thức dành cho doanh nghiệp'}</h2><p>{en ? 'Explore digital transformation experience, AI applications and practical perspectives for more efficient operations.' : 'Khám phá kinh nghiệm chuyển đổi số, ứng dụng AI và những góc nhìn thực tiễn giúp doanh nghiệp vận hành hiệu quả hơn.'}</p></div>
            <Link id="home-insights-view-all-link" to={localizedPath('/blog')} className="home-insights-view-all">{en ? 'View all articles' : 'Xem tất cả bài viết'} <ArrowRight size={17} /></Link>
          </header>
          <div className="home-insights-categories" role="tablist" aria-label={en ? 'Article categories' : 'Danh mục bài viết'}>
            <button id="home-blog-category-all" type="button" role="tab" aria-selected={!activeBlogCategory} className={`home-insights-category ${!activeBlogCategory ? 'active' : ''}`} onClick={() => setActiveBlogCategory(null)}>{en ? 'All' : 'Tất cả'}</button>
            {blogCategoriesQ.loading && !blogCategories.length ? [1, 2, 3, 4].map((item) => <span key={item} className="home-insights-category-skeleton" />) : blogCategories.map((category) => (
              <button id={`home-blog-category-${category._id}`} key={category._id} type="button" role="tab" aria-selected={activeBlogCategory === category._id} className={`home-insights-category ${activeBlogCategory === category._id ? 'active' : ''}`} onClick={() => setActiveBlogCategory(category._id)}>{category.name}</button>
            ))}
          </div>
          {blogsQ.loading && !blogsQ.data ? (
            <div className="home-insights-layout home-insights-loading" aria-label={en ? 'Loading articles' : 'Đang tải bài viết'} aria-busy="true">
              <div className="home-featured-skeleton">
                <div className="home-featured-skeleton-copy">
                  <span className="insights-skeleton-line insights-skeleton-label" />
                  <span className="insights-skeleton-line insights-skeleton-badge" />
                  <span className="insights-skeleton-line insights-skeleton-title" />
                  <span className="insights-skeleton-line insights-skeleton-title short" />
                  <span className="insights-skeleton-line insights-skeleton-text" />
                  <span className="insights-skeleton-line insights-skeleton-text short" />
                </div>
                <div className="insights-skeleton-image home-featured-skeleton-image" />
              </div>
              <div className="home-insights-side-grid">
                {[1, 2, 3, 4].map((item) => (
                  <div className="home-insights-skeleton-card" key={item}>
                    <div className="home-side-skeleton-copy">
                      <span className="insights-skeleton-line insights-skeleton-badge" />
                      <span className="insights-skeleton-line insights-skeleton-side-title" />
                      <span className="insights-skeleton-line insights-skeleton-side-title short" />
                    </div>
                    <div className="insights-skeleton-image home-side-skeleton-image" />
                  </div>
                ))}
              </div>
            </div>
          ) : blogsQ.error ? (
            <div className="home-insights-empty"><p>{en ? 'Articles cannot be loaded right now.' : 'Không thể tải bài viết lúc này.'}</p><button id="home-blog-retry-btn" type="button" onClick={blogsQ.refetch}>{t('common.retry')}</button></div>
          ) : !featuredBlog ? <Empty className="home-insights-empty" description={en ? 'No articles in this category yet' : 'Danh mục này chưa có bài viết'} /> : (
            <div
              key={featuredBlog._id}
              className={`home-insights-layout home-insights-content ${blogsQ.loading ? 'is-updating' : ''} ${sideBlogs.length ? '' : 'single'}`}
              aria-busy={blogsQ.loading}
            >
              <Link id="home-featured-blog-link" to={localizedPath(`/blog/${featuredBlog.slug || featuredBlog._id}`)} className="home-featured-article">
                <div className="home-featured-copy">
                  <span className="home-featured-label">{en ? 'Featured article' : 'Bài viết nổi bật'}</span>
                  <span className="home-blog-category-badge">{featuredBlog.category?.name || featuredBlog.category || t('blog.title')}</span>
                  <h3>{featuredBlog.title}</h3>
                  <p>{featuredBlog.excerpt || featuredBlog.metaDescription || (en ? 'Explore practical insights and experience for businesses.' : 'Khám phá kiến thức và kinh nghiệm thực tiễn dành cho doanh nghiệp.')}</p>
                  <span className="home-blog-date"><Calendar size={15} />{formatDate(featuredBlog.publishedAt || featuredBlog.createdAt)}</span>
                  <span className="home-featured-read">{en ? 'Read article' : 'Đọc bài viết'} <ArrowRight size={17} /></span>
                </div>
                <div className="home-featured-image"><img src={featuredBlog.coverImageUrl || BLOG_FALLBACK} alt={featuredBlog.title} /></div>
              </Link>
              {sideBlogs.length > 0 && <div className="home-insights-side-grid">{sideBlogs.map((blog) => (
                <Link id={`home-blog-${blog._id}-link`} to={localizedPath(`/blog/${blog.slug || blog._id}`)} key={blog._id} className="home-insights-side-card">
                  <div className="home-side-card-copy"><span className="home-blog-category-badge">{blog.category?.name || blog.category || (en ? 'Insights' : 'Kiến thức')}</span><h3>{blog.title}</h3><span className="home-blog-date"><Calendar size={14} />{formatDate(blog.publishedAt || blog.createdAt)}</span></div>
                  <div className="home-side-card-image"><img src={blog.coverImageUrl || BLOG_FALLBACK} alt={blog.title} /></div>
                </Link>
              ))}</div>}
            </div>
          )}
        </div>
      </section>

      <section className="saas-section home-testimonials" aria-labelledby="testimonials-title">
        <div className="saas-container">
          <header className="home-section-heading">
            <span>{en ? 'Customer perspectives' : 'Góc nhìn khách hàng'}</span>
            <h2 id="testimonials-title">{en ? 'What businesses say about Losa' : 'Doanh nghiệp nói gì về Losa'}</h2>
            <p>{en ? 'Real-world applications showing how Losa supports different operating models.' : 'Những tình huống ứng dụng tiêu biểu cho thấy Losa có thể đồng hành cùng nhiều mô hình vận hành khác nhau.'}</p>
          </header>
          <div className="home-testimonial-grid">{(en ? [
            { tag: 'Omnichannel retail', quote: 'Losa brings conversations from multiple channels into one place. After-hours consulting is now seamless, and we have much better control over sales opportunities.', author: 'Nguyễn Minh Anh', position: 'Chief Operating Officer', company: 'An Nhiên Retail', initials: 'MA', avatar: '/images/home_1.webp' },
            { tag: 'Professional services', quote: 'Customer intake and classification are much clearer than before. Employees know exactly whom to prioritize, while managers can easily track progress.', author: 'Trần Quốc Huy', position: 'Head of Sales', company: 'NovaLink Solutions', initials: 'QH', avatar: '/images/home_2.jpg' },
            { tag: 'Customer care', quote: 'Appointment reminders and post-service care workflows create a more consistent customer experience without adding manual work for the team.', author: 'Lê Thảo Nguyên', position: 'Founder', company: 'Mộc An Wellness', initials: 'TN', avatar: '/images/home_3.jpg' }
          ] : [
            { tag: 'Bán lẻ đa kênh', quote: 'Losa giúp đội ngũ gom hội thoại từ nhiều kênh về một nơi. Việc tư vấn ngoài giờ trở nên liền mạch và chúng tôi kiểm soát cơ hội bán hàng tốt hơn.', author: 'Nguyễn Minh Anh', position: 'Giám đốc vận hành', company: 'An Nhiên Retail', initials: 'MA', avatar: '/images/home_1.webp' },
            { tag: 'Dịch vụ chuyên nghiệp', quote: 'Quy trình tiếp nhận và phân loại khách hàng rõ ràng hơn trước. Nhân viên biết chính xác cần ưu tiên ai và quản lý dễ dàng theo dõi tiến độ xử lý.', author: 'Trần Quốc Huy', position: 'Trưởng phòng Kinh doanh', company: 'NovaLink Solutions', initials: 'QH', avatar: '/images/home_2.jpg' },
            { tag: 'Chăm sóc khách hàng', quote: 'Các kịch bản nhắc lịch và chăm sóc sau dịch vụ giúp trải nghiệm khách hàng nhất quán hơn mà đội ngũ không phải tăng thêm khối lượng công việc thủ công.', author: 'Lê Thảo Nguyên', position: 'Nhà sáng lập', company: 'Mộc An Wellness', initials: 'TN', avatar: '/images/home_3.jpg' }
          ]).map((item) => (
            <article className="home-testimonial-card" key={item.author}>
              <div className="home-testimonial-topline">
                <span className="home-testimonial-tag">{item.tag}</span>
                <span className="home-testimonial-stars" aria-label={en ? '5 out of 5 stars' : '5 trên 5 sao'}>★★★★★</span>
              </div>
              <span className="home-testimonial-quote-mark" aria-hidden="true">“</span>
              <blockquote>{item.quote}</blockquote>
              <footer className="home-testimonial-author">
                <span className="home-testimonial-avatar">
                  {item.avatar && item.avatar !== '#'
                    ? <img src={item.avatar} alt={en ? `${item.author}'s avatar` : `Ảnh đại diện của ${item.author}`} loading="lazy" />
                    : item.initials}
                </span>
                <span className="home-testimonial-person">
                  <strong>{item.author}</strong>
                  <small>{item.position}</small>
                </span>
                <span className="home-testimonial-company">{item.company}</span>
              </footer>
            </article>
          ))}</div>
        </div>
      </section>

      <ClientFaqSection faqs={homeFaqs} />
    </main>
  )
}

