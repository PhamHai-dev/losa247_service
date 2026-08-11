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

export function BlogPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);

  const [activeCategory, setActiveCategory] = useState(null);
  const [sort, setSort] = useState('newest');
  const openLeadModal = useUIStore((state) => state.openLeadModal);

  // Reset page when search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const featuredQuery = useApiQuery(
    () => publicBlogsService.getList({ isFeatured: true, limit: 3, category: activeCategory }),
    [activeCategory]
  );
  const featuredList = featuredQuery.data?.items || [];

  const categoriesQuery = useApiQuery(() => publicBlogsService.getCategories(), []);
  const categories = categoriesQuery.data || [];

  const tagsQuery = useApiQuery(() => publicBlogsService.getTags({ limit: 10 }), []);
  const tags = tagsQuery.data || [];

  const latestQuery = useApiQuery(() => publicBlogsService.getList({ limit: 4 }), []);
  const latestBlogs = latestQuery.data?.items || [];

  const mainListQuery = useApiQuery(
    () => publicBlogsService.getList({ page, limit: 9, search: debouncedSearch, category: activeCategory, sort }),
    [page, debouncedSearch, activeCategory, sort]
  );
  const blogs = mainListQuery.data?.items || [];
  const total = mainListQuery.data?.pagination?.total || 0;

  const mainFeatured = featuredList[0];
  const sideFeatured = featuredList.slice(1, 3);

  return (
    <main className="blog-page-container">
      <section className="blog-hero" aria-labelledby="blog-hero-title">
        <div className="blog-container-fluid">
          <div className="blog-hero-inner">
            <motion.div className="blog-hero-content" initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.12 } } }}>
              <motion.span className="blog-hero-badge" variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}><Star size={14} fill="currentColor" /> Góc kiến thức từ Losa</motion.span>
              <motion.h1 id="blog-hero-title" variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>Kiến thức thực chiến để <span>tăng trưởng cùng AI</span></motion.h1>
              <motion.p className="blog-hero-lead" variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>Cập nhật xu hướng, hướng dẫn chuyên sâu và case study thực tế về AI Marketing, AI Sales giúp doanh nghiệp vận hành thông minh hơn mỗi ngày.</motion.p>
              <motion.div className="blog-hero-proof" variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                <span><CircleCheck size={17} /> Xu hướng mới nhất</span>
                <span><CircleCheck size={17} /> Kiến thức ứng dụng</span>
                <span><CircleCheck size={17} /> Case study thực tế</span>
              </motion.div>
              <motion.div className="blog-hero-actions" variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                <button id="blog-hero-explore-btn" type="button" className="saas-btn saas-btn-primary" onClick={() => document.getElementById('blog-categories')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>Khám phá bài viết <ArrowRight size={18} /></button>
                <button id="blog-hero-featured-btn" type="button" className="saas-btn blog-hero-secondary" onClick={() => document.getElementById('blog-articles')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>Xem bài viết nổi bật</button>
              </motion.div>
            </motion.div>
            <motion.div className="blog-hero-illustration" initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
              <div className="blog-hero-glow" />
              <img src="https://res.cloudinary.com/e1d8bnbg/image/upload/v1784799281/logo_blog_qd9i4n.png" alt="Kho kiến thức AI Marketing và AI Sales từ Losa" />
            </motion.div>
          </div>
        </div>
      </section>

      <div id="blog-categories" className="blog-container-fluid" style={{ marginTop: 40, scrollMarginTop: 100 }}>
        <div className="category-pills" style={{ justifyContent: 'center', marginBottom: 40 }}>
          <button className={`category-pill ${!activeCategory ? 'active' : ''}`} onClick={() => { setActiveCategory(null); setPage(1); }}>
            Tất cả
          </button>
          {categories.map(c => (
            <button key={c._id} className={`category-pill ${activeCategory === c._id ? 'active' : ''}`} onClick={() => { setActiveCategory(c._id); setPage(1); }}>
              {c.name}
            </button>
          ))}
        </div>



        <div id="blog-articles" className="blog-layout" style={{ marginTop: 60, scrollMarginTop: 100 }}>
          <div className="blog-main-content">
            {mainFeatured && !search && page === 1 && (
              <div className="featured-section" style={{ marginBottom: 40, ...(sideFeatured.length === 0 ? { gridTemplateColumns: '1fr' } : {}) }}>
                <Link to={`/blog/${mainFeatured.slug}`} className="featured-card large">
                  <div className="featured-content">
                    <span className="featured-label">BÀI VIẾT NỔI BẬT</span>
                    {mainFeatured.category && (
                      <span className="featured-cat">{mainFeatured.category.name}</span>
                    )}
                    <h2>{mainFeatured.title}</h2>
                    <p className="excerpt">{mainFeatured.excerpt || mainFeatured.metaDescription}</p>
                    <div className="blog-meta">
                      <span><CalendarOutlined /> {formatDate(mainFeatured.publishedAt)}</span>
                    </div>
                    <Button type="primary" size="large" className="read-more-btn">
                      Đọc bài viết <RightOutlined />
                    </Button>
                  </div>
                  <div className="featured-image-wrapper">
                    <img src={mainFeatured.coverImageUrl || 'https://placehold.co/800x500/f8fafc/64748b?text=Losa247+Blog'} alt={mainFeatured.title} />
                  </div>
                </Link>

                {sideFeatured.length > 0 && (
                  <div className="featured-side-list">
                    {sideFeatured.map((fb, idx) => (
                      <Link to={`/blog/${fb.slug}`} key={fb._id} className={`featured-card small ${idx === 0 ? 'top-small' : 'bottom-small'}`} style={sideFeatured.length === 1 ? { height: 'calc(50% - 10px)' } : undefined}>
                        <div className="featured-content">
                          {fb.category && (
                            <span className="featured-cat">{fb.category.name}</span>
                          )}
                          <h3>{fb.title}</h3>
                          <div className="blog-meta">
                            <span><CalendarOutlined /> {formatDate(fb.publishedAt)}</span>
                          </div>
                        </div>
                        <div className="featured-image-wrapper">
                          <img src={fb.coverImageUrl || 'https://placehold.co/600x400/f8fafc/64748b?text=Losa247+Blog'} alt={fb.title} />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="blog-filters-row">
              <Input
                size="large"
                placeholder="Tìm kiếm bài viết..."
                prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
                suffix={mainListQuery.loading ? <Spin size="small" /> : null}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-input"
              />
              <Select value={sort} onChange={(val) => { setSort(val); setPage(1); }} size="large" className="sort-select">
                <Select.Option value="newest"><FilterOutlined /> Mới nhất</Select.Option>
                <Select.Option value="oldest"><FilterOutlined /> Cũ nhất</Select.Option>
                <Select.Option value="popular"><FilterOutlined /> Xem nhiều</Select.Option>
              </Select>
            </div>

            <div style={{ position: 'relative', minHeight: 200 }}>
              {mainListQuery.loading && !blogs.length ? (
                <div style={{ textAlign: 'center', padding: '60px 0' }}><Spin size="large" /></div>
              ) : !blogs.length ? (
                <Empty description="Không tìm thấy bài viết nào" style={{ margin: '40px 0' }} />
              ) : (
                <>
                  <div className="main-blog-grid">
                    {blogs.map(b => (
                      <Link to={`/blog/${b.slug}`} key={b._id} className="blog-card">
                        <img src={b.coverImageUrl || 'https://placehold.co/600x400/f8fafc/64748b?text=Losa247+Blog'} alt={b.title} className="blog-card-img" />
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
                      <Pagination current={page} total={total} pageSize={9} onChange={(p) => setPage(p)} showSizeChanger={false} hideOnSinglePage={false} />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="blog-sidebar">
            <div className="sidebar-widget">
              <h3>Danh mục</h3>
              <div>
                <div className={`cat-list-item ${!activeCategory ? 'active' : ''}`} onClick={() => { setActiveCategory(null); setPage(1); }}>
                  <span>Tất cả</span>
                  <span className="cat-count">{categories.reduce((acc, c) => acc + (c.count || 0), 0)}</span>
                </div>
                {categories.map(c => (
                  <div key={c._id} className={`cat-list-item ${activeCategory === c._id ? 'active' : ''}`} onClick={() => { setActiveCategory(c._id); setPage(1); }}>
                    <span>{c.name}</span>
                    <span className="cat-count">{c.count || 0}</span>
                  </div>
                ))}
              </div>
              <div className="view-all-cats">Xem tất cả danh mục <RightOutlined /></div>
            </div>

            <div className="sidebar-widget">
              <h3>Bài viết mới nhất</h3>
              <div>
                {latestBlogs.map(b => (
                  <Link to={`/blog/${b.slug}`} key={b._id} className="latest-post-item">
                    <img src={b.coverImageUrl || 'https://placehold.co/600x400/f8fafc/64748b?text=Losa247+Blog'} alt={b.title} />
                    <div className="info">
                      <h4>{b.title}</h4>
                      <span>{formatDate(b.publishedAt)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="sidebar-widget">
              <h3>Tags phổ biến</h3>
              <div className="popular-tags">
                {tags.map(t => (
                  <Link to={`/tag/${t.slug}`} key={t._id} className="tag-pill">
                    #{t.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="sidebar-widget newsletter-widget">
              <h3>Không bỏ lỡ bài viết mới!</h3>
              <p>Đăng ký nhận bản tin để cập nhật kiến thức và xu hướng mới nhất.</p>
              <Input placeholder="Nhập email của bạn" size="large" style={{ marginBottom: 12, borderRadius: 8 }} />
              <Button id="blog-newsletter-register-btn" type="primary" size="large" block className="newsletter-register-btn" onClick={openLeadModal}>
                Đăng ký ngay <ArrowRight size={17} />
              </Button>
            </div>
          </div>
        </div>

        <div className="features-bottom">
          <div className="feature-item">
            <div className="feature-icon"><CheckCircleOutlined /></div>
            <div>
              <h4 style={{ margin: '0 0 4px 0', fontSize: 15, color: 'var(--navy)' }}>Nội dung chất lượng</h4>
              <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>Kiến thức được chọn lọc và cập nhật thường xuyên</p>
            </div>
          </div>
          <div className="feature-item">
            <div className="feature-icon"><TrophyOutlined /></div>
            <div>
              <h4 style={{ margin: '0 0 4px 0', fontSize: 15, color: 'var(--navy)' }}>Từ chuyên gia</h4>
              <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>Đội ngũ chuyên gia giàu kinh nghiệm trong lĩnh vực</p>
            </div>
          </div>
          <div className="feature-item">
            <div className="feature-icon"><ToolOutlined /></div>
            <div>
              <h4 style={{ margin: '0 0 4px 0', fontSize: 15, color: 'var(--navy)' }}>Ứng dụng thực tế</h4>
              <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>Kiến thức dễ áp dụng, mang lại hiệu quả thực tế</p>
            </div>
          </div>
          <div className="feature-item">
            <div className="feature-icon"><TeamOutlined /></div>
            <div>
              <h4 style={{ margin: '0 0 4px 0', fontSize: 15, color: 'var(--navy)' }}>Cộng đồng hỗ trợ</h4>
              <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>Tham gia cộng đồng để học hỏi và chia sẻ kinh nghiệm</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
// ---- Services -------------------------------------------------------------
