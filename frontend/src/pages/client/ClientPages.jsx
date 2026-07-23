import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Rocket, BriefcaseBusiness, Building2, ArrowRight } from "lucide-react"
import PricingSection from '../../components/client/pricing/PricingSection'
import { App, Button, Empty, Form, Input, InputNumber, Result, Spin, Steps, Select, Pagination, Tag, Skeleton } from 'antd'
import { SearchOutlined, FilterOutlined, CalendarOutlined, EyeOutlined, RightOutlined, CheckCircleOutlined, CloseOutlined, TrophyOutlined, ToolOutlined, TeamOutlined, MenuOutlined, RocketOutlined, ProjectOutlined, BankOutlined, ThunderboltOutlined, ClockCircleOutlined, DollarOutlined, SafetyOutlined, RobotOutlined, CommentOutlined, ContactsOutlined, PartitionOutlined, LineChartOutlined, CustomerServiceOutlined, DownOutlined, UpOutlined, UserOutlined, CrownOutlined } from '@ant-design/icons'
import { useApiQuery } from '../../hooks/useApiQuery'
import { formatCurrency, formatDate } from '../../utils/format'
import { publicServicesService } from '../../features/services/servicesService'
import { publicStoreProductsService } from '../../features/storeProducts/storeProductsService'
import { publicBlogsService } from '../../features/blogs/blogsService'
import { publicFaqsService } from '../../features/faqs/faqsService'
import { publicPricingService } from '../../features/services/pricingService'
import { cartService } from '../../features/cart/cartService'
import { checkoutService } from '../../features/checkout/checkoutService'
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
export function Reveal({ children, className = '' }) {
  const [active, setActive] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { 
        if (entry.isIntersecting) { 
          setActive(true); 
          observer.disconnect(); 
        } 
      },
      { rootMargin: '0px 0px -100px 0px', threshold: 0 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`reveal-up ${active ? 'active' : ''} ${className}`}>
      {children}
    </div>
  );
}

// ---- Home -----------------------------------------------------------------
export function HomePage() {
  const servicesQ = useApiQuery(() => publicServicesService.getList({ limit: 3 }), [])
  const blogsQ = useApiQuery(() => publicBlogsService.getList({ limit: 3 }), [])
  const services = servicesQ.data?.items || []
  const blogs = blogsQ.data?.items || []

  return (
    <>
      <section className="hero"><div className="container hero-grid">
        <div>
          <div className="eyebrow">AI Sales Agent cho shop online</div>
          <h1>Tự động tư vấn, chốt đơn và chăm sóc khách 24/7</h1>
          <p>LOSA247 kết hợp AI chatbot, CRM lead, workflow n8n và báo cáo realtime để đội sales tăng tốc mà không bỏ sót khách hàng.</p>
          <p><Link className="btn btn-primary" to="/dang-ky">Dùng thử miễn phí</Link> <Link className="btn btn-outline" to="/dich-vu">Xem demo</Link></p>
        </div>
        <div className="card chat-demo">
          <b>Sales Agent Live <span className="badge active">● Online</span></b>
          <div className="bubble">Em cần tư vấn gói chatbot cho Facebook.</div>
          <div className="bubble me">Shop mình 30 đơn/ngày, muốn tự động inbox.</div>
          <div className="bubble">Gói Pro phù hợp nhất. Em tạo lead và gửi demo ngay nhé!</div>
        </div>
      </div></section>

      <section className="section"><div className="container grid usp-grid">
        {['Thu lead tự động', 'Chốt đơn nhanh', 'Tích hợp n8n', 'Báo cáo realtime'].map((x, i) => (
          <Reveal key={x} style={{ transitionDelay: `${i * 0.15}s` }}>
            <div className="card price-card"><h3>✨ {x}</h3><p>Tối ưu toàn bộ hành trình khách hàng từ tin nhắn đầu tiên đến thanh toán.</p></div>
          </Reveal>
        ))}
      </div></section>

      <section className="section"><div className="container">
        <h2>Dịch vụ nổi bật</h2>
        {servicesQ.loading ? (
          <div className="grid pricing">
            {[1, 2, 3].map(i => <div className="card price-card" key={i}><Skeleton active paragraph={{ rows: 3 }} /></div>)}
          </div>
        ) : (
          !services.length ? <Empty description="Chưa có dịch vụ" /> : (
            <div className="grid pricing">
              {services.map((s, i) => (
                <Reveal className={`card price-card ${s.popular ? 'popular' : ''}`} key={s._id} style={{ transitionDelay: `${i * 0.15}s` }}>
                  <h3>{s.name}</h3><h2>{formatCurrency(s.price)}</h2>
                  <p>{s.description}</p>
                  <Link className="btn btn-primary" to={`/dich-vu/${s.slug || s._id}`}>Xem chi tiết</Link>
                </Reveal>
              ))}
            </div>
          )
        )}
      </div></section>

      <section className="section"><div className="container">
        <h2>Blog mới nhất</h2>
        {blogsQ.loading ? (
          <div className="grid blog-grid">
            {[1, 2, 3].map(i => <div className="card price-card" key={i}><Skeleton active title={false} paragraph={{ rows: 2 }} /></div>)}
          </div>
        ) : (
          <div className="grid blog-grid">
            {blogs.map((b, i) => (
              <Reveal key={b._id} style={{ transitionDelay: `${i * 0.15}s` }}>
                <Link className="card price-card" to={`/blog/${b.slug || b._id}`} style={{ display: 'block' }}>
                  <span className="badge processing" style={{ marginBottom: 12 }}>{b.category?.name || b.category || 'Blog'}</span>
                  <h3 style={{ margin: '0 0 8px 0' }}>{b.title}</h3>
                  <p style={{ margin: 0, color: 'var(--muted)' }}>{formatDate(b.publishedAt || b.createdAt)}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </div></section>
    </>
  )
}

// ---- Blog -----------------------------------------------------------------
export function BlogPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);

  const [activeCategory, setActiveCategory] = useState(null);
  const [sort, setSort] = useState('newest');

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
      <section className="blog-hero">
        <div className="blog-container-fluid">
          <div className="blog-hero-inner">
            <div className="blog-hero-content">
              <span className="blog-hero-badge">BLOG</span>
              <h1>Kiến thức AI Marketing<br />và AI Sales</h1>
              <p>Cập nhật xu hướng, hướng dẫn, case study và các giải pháp giúp doanh nghiệp tăng trưởng với AI.</p>
              <button className="blog-hero-btn">Khám phá bài viết <ArrowRight size={18} /></button>
            </div>
            <div className="blog-hero-illustration">
              <img src="https://res.cloudinary.com/e1d8bnbg/image/upload/v1784799281/logo_blog_qd9i4n.png" alt="Blog Illustration" />
            </div>
          </div>
        </div>
      </section>

      <div className="blog-container-fluid" style={{ marginTop: 40 }}>
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



        <div className="blog-layout" style={{ marginTop: 60 }}>
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
              <Button type="primary" size="large" block style={{ borderRadius: 8, fontWeight: 600 }}>
                Đăng ký ngay
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
export function ServicesPage() {
  const plansQuery = useApiQuery(() => publicPricingService.getPlans(), [])
  const compQuery = useApiQuery(() => publicPricingService.getComparisons(), [])
  const faqsQuery = useApiQuery(() => publicFaqsService.getList(), [])

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
            <h1 className="saas-hero-title">Dịch vụ <span>Chatbot</span></h1>
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

              {/* FAQ Section */}
              {faqs.length > 0 && (
                <div className="saas-faq-wrapper">
                  <h2 className="saas-section-title">Câu hỏi thường gặp</h2>
                  <div className="saas-faq-list">
                    {faqs.map((f) => (
                      <div
                        key={f._id}
                        className={`saas-faq-item ${faqOpen === f._id ? 'active' : ''}`}
                        onClick={() => setFaqOpen(faqOpen === f._id ? null : f._id)}
                      >
                        <div className="saas-faq-question" onClick={() => setFaqOpen(faqOpen === f._id ? null : f._id)}>
                          <span>{f.question}</span>
                          {faqOpen === f._id ? <UpOutlined /> : <DownOutlined />}
                        </div>
                        <div className="saas-faq-answer">
                          <div className="saas-faq-answer-inner">{f.answer}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </>
          )}
        </Spin>
      </div>

    </main>
  )
}

export function ServiceDetailPage() {
  const { id } = useParams()
  const addToCart = useAddToCart()
  const query = useApiQuery(() => publicServicesService.getBySlug(id), [id])
  const service = query.data
  return (
    <main className="section"><div className="container">
      <Spin spinning={query.loading}>
        {!service && !query.loading ? <Empty description="Không tìm thấy dịch vụ" /> : service && (
          <div className="card price-card">
            <h1>{service.name}</h1>
            <h2>{formatCurrency(service.price)}</h2>
            <p>{service.description}</p>
            <Button type="primary" onClick={() => addToCart({ serviceId: service._id, qty: 1 })}>Thêm vào giỏ</Button>
          </div>
        )}
      </Spin>
    </div></main>
  )
}

// ---- Store ----------------------------------------------------------------
export function StorePage() {
  const query = useApiQuery(() => publicStoreProductsService.getList({ limit: 50 }), [])
  const products = query.data?.items || []
  return (
    <main className="section"><div className="container">
      <h1>Gian hàng workflow</h1>
      <Spin spinning={query.loading}>
        {!products.length && !query.loading ? <Empty description="Chưa có sản phẩm" /> : (
          <div className="grid product-grid">
            {products.map((p) => (
              <Link className="card price-card" to={`/gian-hang/${p._id}`} key={p._id}>
                <span className="badge pending">{p.platform}</span>
                <h3>{p.name}</h3><p>{p.description}</p><b>{formatCurrency(p.price)}</b>
              </Link>
            ))}
          </div>
        )}
      </Spin>
    </div></main>
  )
}

export function StoreDetailPage() {
  const { id } = useParams()
  const addToCart = useAddToCart()
  const query = useApiQuery(() => publicStoreProductsService.getById(id), [id])
  const product = query.data
  return (
    <main className="section"><div className="container">
      <Spin spinning={query.loading}>
        {!product && !query.loading ? <Empty description="Không tìm thấy sản phẩm" /> : product && (
          <div className="card price-card">
            <span className="badge pending">{product.platform}</span>
            <h1>{product.name}</h1>
            <h2>{formatCurrency(product.price)}</h2>
            <p>{product.description}</p>
            <Button type="primary" onClick={() => addToCart({ storeProductId: product._id, qty: 1 })}>Thêm vào giỏ</Button>
          </div>
        )}
      </Spin>
    </div></main>
  )
}

// ---- FAQ ------------------------------------------------------------------
export function FaqPage() {
  const [open, setOpen] = useState(null)
  const query = useApiQuery(() => publicFaqsService.getList(), [])
  const faqs = query.data?.items || []
  return (
    <main className="section"><div className="container">
      <h1>Hỏi đáp</h1>
      <Spin spinning={query.loading}>
        {!faqs.length && !query.loading ? <Empty description="Chưa có câu hỏi" /> : faqs.map((f) => (
          <div className="card price-card" key={f._id} onClick={() => setOpen(open === f._id ? null : f._id)} style={{ cursor: 'pointer' }}>
            <h3>{open === f._id ? '−' : '+'} {f.question}</h3>
            {open === f._id && <p>{f.answer}</p>}
          </div>
        ))}
      </Spin>
    </div></main>
  )
}

// ---- Account --------------------------------------------------------------
export function AccountPage() {
  const { user } = useAuthStore()
  return (
    <main className="section"><div className="container card price-card">
      <h1>Tài khoản của tôi</h1>
      {user ? (
        <>
          <p><b>Họ tên:</b> {user.name}</p>
          <p><b>Email:</b> {user.email}</p>
          {user.phone && <p><b>SĐT:</b> {user.phone}</p>}
          {/* Lịch sử đơn hàng cần endpoint GET /orders (client) — xem API_ADDITIONS.md */}
          <p style={{ opacity: 0.7 }}>Lịch sử đơn hàng sẽ hiển thị khi backend bổ sung GET /orders (client).</p>
        </>
      ) : (
        <Result status="info" title="Bạn chưa đăng nhập" extra={<Link className="btn btn-primary" to="/dang-nhap">Đăng nhập</Link>} />
      )}
    </div></main>
  )
}

// ---- Cart -----------------------------------------------------------------
export function CartPage() {
  const { message } = App.useApp()
  const navigate = useNavigate()
  const { authType } = useAuthStore()
  const query = useApiQuery(() => cartService.getCart(), [], { enabled: authType === 'client' })
  const items = query.data || []

  const lineOf = (it) => (it.serviceId?.price ?? it.storeProductId?.price ?? it.price ?? 0) * (it.qty || 1)
  const total = items.reduce((sum, it) => sum + lineOf(it), 0)

  const updateQty = async (it, qty) => {
    if (qty < 1) return
    try { await cartService.updateItem(it._id, qty); query.refetch() } catch { message.error('Không cập nhật được') }
  }
  const remove = async (it) => {
    try { await cartService.removeItem(it._id); message.success('Đã xoá'); query.refetch() } catch { message.error('Không xoá được') }
  }

  if (authType !== 'client') {
    return <main className="section"><div className="container"><Result status="info" title="Đăng nhập để xem giỏ hàng" extra={<Link className="btn btn-primary" to="/dang-nhap">Đăng nhập</Link>} /></div></main>
  }

  return (
    <main className="section"><div className="container cart-layout">
      <div className="card price-card">
        <h1>Giỏ hàng</h1>
        <Spin spinning={query.loading}>
          {!items.length && !query.loading ? <Empty description="Giỏ hàng trống" /> : items.map((it) => {
            const name = it.serviceId?.name || it.storeProductId?.name || it.name || 'Sản phẩm'
            return (
              <div key={it._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '8px 0', borderBottom: '1px solid #eee' }}>
                <span>🛒 {name}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <InputNumber min={1} value={it.qty} onChange={(v) => updateQty(it, v)} size="small" style={{ width: 70 }} />
                  <b>{formatCurrency(lineOf(it))}</b>
                  <Button size="small" danger onClick={() => remove(it)}>Xoá</Button>
                </span>
              </div>
            )
          })}
        </Spin>
      </div>
      <aside className="card price-card">
        <h2>Tổng kết</h2>
        <p>Tạm tính: <b>{formatCurrency(total)}</b></p>
        <Button type="primary" disabled={!items.length} onClick={() => navigate('/thanh-toan')} block>Tiến hành thanh toán</Button>
      </aside>
    </div></main>
  )
}

// ---- Checkout -------------------------------------------------------------
export function CheckoutPage() {
  const { message } = App.useApp()
  const { authType, user } = useAuthStore()
  const [step, setStep] = useState(0)
  const [order, setOrder] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [form] = Form.useForm()

  const submit = async (values) => {
    setSubmitting(true)
    try {
      const created = await checkoutService.createOrder(values)
      setOrder(created)
      setStep(2)
      message.success('Đặt hàng thành công')
    } catch (e) {
      message.error(e?.error?.message || 'Không tạo được đơn hàng')
    } finally { setSubmitting(false) }
  }

  if (authType !== 'client') {
    return <main className="section"><div className="container"><Result status="info" title="Đăng nhập để thanh toán" extra={<Link className="btn btn-primary" to="/dang-nhap">Đăng nhập</Link>} /></div></main>
  }

  return (
    <main className="section"><div className="container card price-card">
      <h1>Thanh toán</h1>
      <Steps current={step} style={{ margin: '20px 0' }}
        items={[{ title: 'Thông tin' }, { title: 'Xác nhận' }, { title: 'Hoàn tất' }]} />

      {step < 2 && (
        <Form form={form} layout="vertical" initialValues={{ customerName: user?.name, customerPhone: user?.phone, customerEmail: user?.email, paymentMethod: 'transfer' }}
          onFinish={submit} onValuesChange={() => setStep(1)}>
          <Form.Item name="customerName" label="Họ tên" rules={[{ required: true, message: 'Nhập họ tên' }]}><Input /></Form.Item>
          <Form.Item name="customerPhone" label="Số điện thoại" rules={[{ required: true, min: 9, message: 'SĐT không hợp lệ' }]}><Input /></Form.Item>
          <Form.Item name="customerEmail" label="Email"><Input /></Form.Item>
          <Form.Item name="paymentMethod" label="Phương thức"><Input placeholder="transfer / momo / vnpay" /></Form.Item>
          <Button type="primary" htmlType="submit" loading={submitting}>Đặt hàng</Button>
        </Form>
      )}

      {step === 2 && order && (
        <Result status="success" title="Đặt hàng thành công!" subTitle={`Mã đơn: ${order.code} • Tổng: ${formatCurrency(order.total)}`}
          extra={[<Link className="btn btn-primary" to="/tai-khoan" key="acc">Về tài khoản</Link>]} />
      )}
    </div></main>
  )
}

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
        const headings = contentRef.current.querySelectorAll('h2, h3, h4');
        const tocList = [];
        headings.forEach((h, i) => {
          if (!h.id) h.id = `heading-${i}`;
          tocList.push({
            id: h.id,
            index: i,
            text: h.innerText,
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
      const headings = Array.from(contentRef.current.querySelectorAll('h2, h3, h4'));
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

  const hasHeadings = blog?.content && blog?.showToc !== false ? /<h[2-4]/.test(blog.content) : false;

  return (
    <main className="section"><div className="container">
      <Spin spinning={query.loading}>
        {!blog && !query.loading ? <Empty description="Không tìm thấy bài viết" /> : blog && (
          <div style={{
            paddingTop: '40px',
            maxWidth: showToc && hasHeadings ? 1200 : 800,
            margin: '0 auto',
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

            <div style={{ marginBottom: 32 }}>
              {blog.category && <span style={{ color: 'var(--orange)', fontWeight: 600, fontSize: 14 }}>{blog.category.name}</span>}
              <h1 style={{ fontSize: 'clamp(28px, 5vw, 42px)', margin: '16px 0', lineHeight: 1.3 }}>{blog.title}</h1>
              <div className="blog-meta">
                <span><CalendarOutlined /> {formatDate(blog.publishedAt)}</span>
                <span><EyeOutlined /> {blog.views || 0} lượt xem</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 40, alignItems: 'flex-start' }}>
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
