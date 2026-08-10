import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight, BarChart3, Bot, Calendar, CheckCircle2, ChevronDown, ChevronUp,
  CircleCheck, Clock3, Headset, MessageCircleMore, ShieldCheck,
  Sparkles, Star, TrendingDown, Workflow
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
              { icon: <Clock3 />, value: '24/7', title: 'Vận hành liên tục', text: 'Tiếp nhận và xử lý yêu cầu khách hàng bất kể thời gian.' },
              { icon: <TrendingDown />, value: '80%', title: 'Giảm công việc thủ công', text: 'Tự động hóa tác vụ lặp lại để đội ngũ tập trung vào tăng trưởng.' },
              { icon: <Workflow />, value: 'Đa kênh', title: 'Kết nối đồng bộ', text: 'Hợp nhất tương tác và dữ liệu khách hàng trên nhiều nền tảng.' },
              { icon: <ShieldCheck />, value: 'Linh hoạt', title: 'Theo đúng nghiệp vụ', text: 'Tùy chỉnh quy trình theo mô hình và mục tiêu của từng doanh nghiệp.' }
            ].map((item) => (
              <motion.article className="home-why-item" variants={fadeUp} key={item.title}>
                <span className="home-why-icon">{item.icon}</span>
                <strong>{item.value}</strong>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
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
          <header className="home-section-heading"><span>Khách hàng chia sẻ</span><h2 id="testimonials-title">Doanh nghiệp nói gì về Losa</h2><p>Câu chuyện thành công thực tế từ những doanh nghiệp đang vận hành cùng Losa.</p></header>
          <div className="home-testimonial-grid">{[
            { stat: 'Giảm 60% thời gian phản hồi', quote: 'Từ khi dùng Losa, khách hàng được tư vấn ngay cả lúc nửa đêm và đội ngũ không còn bỏ lỡ cơ hội bán hàng.', author: 'Nguyễn Văn A', role: 'CEO – Thời trang X' },
            { stat: 'Tăng 40% năng suất Sale', quote: 'Quy trình báo giá và quản lý khách hàng tập trung giúp đội ngũ bán hàng xử lý cơ hội nhanh, chính xác hơn.', author: 'Trần Thị B', role: 'Giám đốc Kinh doanh – BĐS Y' },
            { stat: 'Tăng 25% khách quay lại', quote: 'Hệ thống tự động nhắc lịch và chăm sóc khách cũ giúp chúng tôi duy trì trải nghiệm nhất quán mà không tăng nhân sự.', author: 'Lê Văn C', role: 'Founder – Spa Z' }
          ].map((item) => <article className="home-testimonial-card" key={item.author}><span>{item.stat}</span><p>“{item.quote}”</p><div><strong>{item.author}</strong><small>{item.role}</small></div></article>)}</div>
        </div>
      </section>

      <section className="saas-section home-final-cta"><div className="saas-container"><div className="home-cta-box"><div><span>Chuyển đổi hôm nay</span><h2>Sẵn sàng để Losa đồng hành cùng doanh nghiệp bạn?</h2><p>Chia sẻ bài toán vận hành, đội ngũ Losa sẽ tư vấn giải pháp phù hợp với mục tiêu và quy mô của bạn.</p></div><button id="home-final-consultation-btn" type="button" onClick={openLeadModal}>Đăng ký tư vấn miễn phí <ArrowRight size={18} /></button></div></div></section>

      <section className="saas-section home-faq-section" id="home-faq" aria-labelledby="home-faq-title">
        <div className="saas-container home-faq-layout">
          <div className="home-faq-intro"><span className="home-faq-eyebrow"><MessageCircleMore size={15} /> Giải đáp cùng Losa</span><h2 id="home-faq-title">Câu hỏi thường gặp</h2><p>Tìm hiểu nhanh về giải pháp, quy trình triển khai và cách Losa đồng hành cùng doanh nghiệp trong hành trình chuyển đổi số.</p><div className="home-faq-assurance"><span className="home-faq-assurance-icon"><Headset size={24} /></span><div><strong>Bạn cần tư vấn thêm?</strong><span>Đội ngũ Losa luôn sẵn sàng lắng nghe bài toán của doanh nghiệp.</span></div></div><button id="home-faq-consultation-btn" type="button" onClick={openLeadModal} className="home-faq-cta">Nhận tư vấn miễn phí <ArrowRight size={17} /></button></div>
          <div className="home-faq-accordion-wrap"><Collapse className="home-faq-collapse" accordion ghost expandIconPosition="end" expandIcon={({ isActive }) => <span className={`home-faq-toggle ${isActive ? 'active' : ''}`}>{isActive ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</span>} items={homeFaqs.length ? homeFaqs.map((faq, index) => ({ key: faq._id, label: <span className="home-faq-question"><span>{String(index + 1).padStart(2, '0')}</span>{faq.question}</span>, children: <p className="home-faq-answer">{faq.answer}</p> })) : [{ key: 'empty', label: <span className="home-faq-question"><span>01</span>Thông tin đang được cập nhật</span>, children: <p className="home-faq-answer">Bạn có thể liên hệ Losa để được giải đáp trực tiếp.</p> }]} /></div>
        </div>
      </section>
    </main>
  )
}
