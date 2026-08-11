import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight, BarChart3, Bot, Calendar, CheckCircle2, ChevronDown, ChevronUp,
  CircleCheck, Clock3, Headset, MessageCircleMore,
  Sparkles, Star, Workflow
} from 'lucide-react'
import { FaFacebookMessenger, FaInstagram, FaTelegramPlane, FaWhatsapp } from 'react-icons/fa'
import { SiZalo } from 'react-icons/si'
import { Collapse, Empty, Skeleton } from 'antd'
import { motion } from 'framer-motion'
import { useApiQuery } from '../../hooks/useApiQuery'
import { formatDate } from '../../utils/format'
import { publicBlogsService } from '../../features/blogs/blogsService'
import { publicFaqsService } from '../../features/faqs/faqsService'
import { useUIStore } from '../../stores/uiStore'
import { ClientFaqSection } from '../../components/client/ClientFaqSection'

const BLOG_FALLBACK = 'https://res.cloudinary.com/e1d8bnbg/image/upload/v1784799281/logo_blog_qd9i4n.png'

const fadeUp = {
  hidden: { opacity: 0, y: 26 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55 } }
}

const stagger = { visible: { transition: { staggerChildren: 0.12 } } }

export function HomePage() {
  const [activeBlogCategory, setActiveBlogCategory] = useState(null)
  const openLeadModal = useUIStore((state) => state.openLeadModal)

  const blogCategoriesQ = useApiQuery(() => publicBlogsService.getCategories(), [])
  const blogsQ = useApiQuery(
    () => publicBlogsService.getList({ limit: 5, category: activeBlogCategory || undefined }),
    [activeBlogCategory]
  )
  const faqsQ = useApiQuery(() => publicFaqsService.getList({ pageType: 'home' }), [])

  const blogCategories = blogCategoriesQ.data || []
  const blogs = blogsQ.data?.items || []
  const featuredBlog = blogs.find((blog) => blog.isFeatured) || blogs[0]
  const sideBlogs = featuredBlog ? blogs.filter((blog) => blog._id !== featuredBlog._id).slice(0, 4) : []
  const homeFaqs = faqsQ.data?.items || []

  return (
    <main className="client-app-wrapper home-page">
      <section className="home-hero" aria-labelledby="home-hero-title">
        <div className="saas-container home-hero-grid">
          <motion.div className="home-hero-content" initial="hidden" animate="visible" variants={stagger}>
            <motion.span className="home-hero-badge" variants={fadeUp}><Star size={14} fill="currentColor" /> Được tin dùng bởi hơn 200 doanh nghiệp</motion.span>
            <motion.h1 id="home-hero-title" variants={fadeUp}>Vận hành thông minh hơn với <span>hệ sinh thái Losa</span></motion.h1>
            <motion.p className="home-hero-lead" variants={fadeUp}>Giải pháp chuyển đổi số giúp doanh nghiệp tự động hóa bán hàng, chăm sóc khách hàng và quản trị dữ liệu trên một nền tảng thống nhất.</motion.p>
            <motion.div className="home-hero-proof" variants={fadeUp}>
              <span><CircleCheck size={17} /> Tư vấn 24/7</span>
              <span><CircleCheck size={17} /> Kết nối đa kênh</span>
              <span><CircleCheck size={17} /> Tùy chỉnh theo nghiệp vụ</span>
            </motion.div>
            <motion.div className="home-hero-actions" variants={fadeUp}>
              <button id="home-hero-explore-btn" type="button" className="saas-btn saas-btn-primary" onClick={() => document.getElementById('ecosystem')?.scrollIntoView({ behavior: 'smooth' })}>Khám phá giải pháp <ArrowRight size={18} /></button>
              <button id="home-hero-consultation-btn" type="button" className="saas-btn home-hero-secondary" onClick={openLeadModal}>Đăng ký tư vấn miễn phí</button>
            </motion.div>
          </motion.div>

          <motion.div className="home-hero-visual" initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <div className="home-hero-glow" />
            <img className="home-hero-main-image" src="https://res.cloudinary.com/e1d8bnbg/image/upload/v1786006189/Main_image_nttqte.png" alt="Hệ sinh thái giải pháp chuyển đổi số Losa" />
            <img className="home-hero-robot" src="https://res.cloudinary.com/e1d8bnbg/image/upload/v1784878046/logo_bot_home_gmhrdk.png" alt="Trợ lý AI Losa" />
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
            <span>Giá trị khác biệt</span>
            <h2 id="home-why-title">Vì sao doanh nghiệp chọn Losa?</h2>
            <p>Công nghệ được thiết kế để tạo ra hiệu quả vận hành đo lường được, không chỉ dừng ở một công cụ trò chuyện.</p>
          </header>
          <motion.div className="home-why-grid" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            {[
              { icon: <Clock3 />, value: '24/7', title: 'Không bỏ lỡ khách hàng', text: 'Phản hồi và chăm sóc liên tục, kể cả ngoài giờ làm việc.' },
              { icon: <MessageCircleMore />, value: 'Đa kênh', title: 'Một luồng hội thoại', text: 'Kết nối Website, Zalo, Messenger và các kênh phổ biến.' },
              { icon: <BarChart3 />, value: 'Tập trung', title: 'Dữ liệu trên một nền tảng', text: 'Quản lý khách hàng và hiệu quả vận hành tại một nơi duy nhất.' },
              { icon: <Bot />, value: 'AI', title: 'Tự động hóa thông minh', text: 'Giảm tác vụ lặp lại để đội ngũ tập trung vào chuyển đổi.' },
              { icon: <Workflow />, value: 'Linh hoạt', title: 'Thiết kế theo nghiệp vụ', text: 'Tùy chỉnh quy trình phù hợp từng mô hình và giai đoạn tăng trưởng.' }
            ].map((item) => (
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
            <span>Giải pháp toàn diện</span>
            <h2 id="ecosystem-title">Hệ sinh thái Losa – Giải pháp chuyển đổi số cho doanh nghiệp</h2>
            <p>Kết nối giao tiếp thông minh với quản trị dữ liệu tập trung để tạo nên một quy trình vận hành liền mạch.</p>
          </header>
          <div className="home-solution-grid">
            {[
              { title: 'Giải pháp Chatbot AI', text: 'Tư vấn, chăm sóc và hỗ trợ bán hàng 24/7 trên nhiều kênh. Chatbot hiểu ngữ cảnh và được đào tạo theo dữ liệu riêng.', to: '/giai-phap/chatbot', icon: <Bot />, accent: 'blue', tags: ['Tư vấn 24/7', 'Đa kênh', 'Hiểu ngữ cảnh'] },
              { title: 'Giải pháp CRM', text: 'Quản lý khách hàng tập trung, theo dõi cơ hội bán hàng và tự động hóa quy trình chăm sóc trên một hệ thống duy nhất.', to: '/giai-phap/crm', icon: <BarChart3 />, accent: 'violet', tags: ['Dữ liệu tập trung', 'Quản lý cơ hội', 'Tự động chăm sóc'] }
            ].map((solution) => (
              <article className={`home-solution-card ${solution.accent}`} key={solution.title}>
                <div className="home-solution-icon">{solution.icon}</div>
                <div className="home-solution-copy">
                  <span className="home-solution-kicker"><Sparkles size={14} /> Giải pháp Losa</span>
                  <h3>{solution.title}</h3>
                  <p>{solution.text}</p>
                  <div className="home-solution-tags">{solution.tags.map((tag) => <span key={tag}><CheckCircle2 size={14} />{tag}</span>)}</div>
                  <Link id={`home-${solution.accent}-solution-link`} to={solution.to}>Xem thêm <ArrowRight size={17} /></Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="saas-section home-insights-section" id="home-insights" aria-labelledby="home-insights-title">
        <div className="saas-container">
          <header className="home-insights-heading">
            <div><span className="home-insights-eyebrow">Kiến thức & xu hướng</span><h2 id="home-insights-title">Góc kiến thức dành cho doanh nghiệp</h2><p>Khám phá kinh nghiệm chuyển đổi số, ứng dụng AI và những góc nhìn thực tiễn giúp doanh nghiệp vận hành hiệu quả hơn.</p></div>
            <Link id="home-insights-view-all-link" to="/blog" className="home-insights-view-all">Xem tất cả bài viết <ArrowRight size={17} /></Link>
          </header>
          <div className="home-insights-categories" role="tablist" aria-label="Danh mục bài viết">
            <button id="home-blog-category-all" type="button" role="tab" aria-selected={!activeBlogCategory} className={`home-insights-category ${!activeBlogCategory ? 'active' : ''}`} onClick={() => setActiveBlogCategory(null)}>Tất cả</button>
            {blogCategoriesQ.loading && !blogCategories.length ? [1, 2, 3, 4].map((item) => <span key={item} className="home-insights-category-skeleton" />) : blogCategories.map((category) => (
              <button id={`home-blog-category-${category._id}`} key={category._id} type="button" role="tab" aria-selected={activeBlogCategory === category._id} className={`home-insights-category ${activeBlogCategory === category._id ? 'active' : ''}`} onClick={() => setActiveBlogCategory(category._id)}>{category.name}</button>
            ))}
          </div>
          {blogsQ.loading ? (
            <div className="home-insights-layout home-insights-loading"><Skeleton active paragraph={{ rows: 6 }} /><div className="home-insights-side-grid">{[1, 2, 3, 4].map((item) => <div className="home-insights-skeleton-card" key={item}><Skeleton active paragraph={{ rows: 2 }} /></div>)}</div></div>
          ) : blogsQ.error ? (
            <div className="home-insights-empty"><p>Không thể tải bài viết lúc này.</p><button id="home-blog-retry-btn" type="button" onClick={blogsQ.refetch}>Thử lại</button></div>
          ) : !featuredBlog ? <Empty className="home-insights-empty" description="Danh mục này chưa có bài viết" /> : (
            <motion.div key={activeBlogCategory || 'all'} className={`home-insights-layout ${sideBlogs.length ? '' : 'single'}`} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <Link id="home-featured-blog-link" to={`/blog/${featuredBlog.slug || featuredBlog._id}`} className="home-featured-article">
                <div className="home-featured-copy">
                  <span className="home-featured-label">Bài viết nổi bật</span>
                  <span className="home-blog-category-badge">{featuredBlog.category?.name || featuredBlog.category || 'Kiến thức'}</span>
                  <h3>{featuredBlog.title}</h3>
                  <p>{featuredBlog.excerpt || featuredBlog.metaDescription || 'Khám phá kiến thức và kinh nghiệm thực tiễn dành cho doanh nghiệp.'}</p>
                  <span className="home-blog-date"><Calendar size={15} />{formatDate(featuredBlog.publishedAt || featuredBlog.createdAt)}</span>
                  <span className="home-featured-read">Đọc bài viết <ArrowRight size={17} /></span>
                </div>
                <div className="home-featured-image"><img src={featuredBlog.coverImageUrl || BLOG_FALLBACK} alt={featuredBlog.title} /></div>
              </Link>
              {sideBlogs.length > 0 && <div className="home-insights-side-grid">{sideBlogs.map((blog) => (
                <Link id={`home-blog-${blog._id}-link`} to={`/blog/${blog.slug || blog._id}`} key={blog._id} className="home-insights-side-card">
                  <div className="home-side-card-copy"><span className="home-blog-category-badge">{blog.category?.name || blog.category || 'Kiến thức'}</span><h3>{blog.title}</h3><span className="home-blog-date"><Calendar size={14} />{formatDate(blog.publishedAt || blog.createdAt)}</span></div>
                  <div className="home-side-card-image"><img src={blog.coverImageUrl || BLOG_FALLBACK} alt={blog.title} /></div>
                </Link>
              ))}</div>}
            </motion.div>
          )}
        </div>
      </section>

      <section className="saas-section home-testimonials" aria-labelledby="testimonials-title">
        <div className="saas-container">
          <header className="home-section-heading">
            <span>Góc nhìn khách hàng</span>
            <h2 id="testimonials-title">Doanh nghiệp nói gì về Losa</h2>
            <p>Những tình huống ứng dụng tiêu biểu cho thấy Losa có thể đồng hành cùng nhiều mô hình vận hành khác nhau.</p>
          </header>
          <div className="home-testimonial-grid">{[
            { tag: 'Bán lẻ đa kênh', quote: 'Losa giúp đội ngũ gom hội thoại từ nhiều kênh về một nơi. Việc tư vấn ngoài giờ trở nên liền mạch và chúng tôi kiểm soát cơ hội bán hàng tốt hơn.', author: 'Nguyễn Minh Anh', position: 'Giám đốc vận hành', company: 'An Nhiên Retail', initials: 'MA' },
            { tag: 'Dịch vụ chuyên nghiệp', quote: 'Quy trình tiếp nhận và phân loại khách hàng rõ ràng hơn trước. Nhân viên biết chính xác cần ưu tiên ai và quản lý dễ dàng theo dõi tiến độ xử lý.', author: 'Trần Quốc Huy', position: 'Trưởng phòng Kinh doanh', company: 'NovaLink Solutions', initials: 'QH' },
            { tag: 'Chăm sóc khách hàng', quote: 'Các kịch bản nhắc lịch và chăm sóc sau dịch vụ giúp trải nghiệm khách hàng nhất quán hơn mà đội ngũ không phải tăng thêm khối lượng công việc thủ công.', author: 'Lê Thảo Nguyên', position: 'Nhà sáng lập', company: 'Mộc An Wellness', initials: 'TN' }
          ].map((item) => (
            <article className="home-testimonial-card" key={item.author}>
              <div className="home-testimonial-topline">
                <span className="home-testimonial-tag">{item.tag}</span>
                <span className="home-testimonial-stars" aria-label="5 trên 5 sao">★★★★★</span>
              </div>
              <span className="home-testimonial-quote-mark" aria-hidden="true">“</span>
              <blockquote>{item.quote}</blockquote>
              <footer className="home-testimonial-author">
                <span className="home-testimonial-avatar">{item.initials}</span>
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
