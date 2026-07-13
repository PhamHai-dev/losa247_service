import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { App, Button, Empty, Form, Input, InputNumber, Result, Spin, Steps } from 'antd'
import { useApiQuery } from '../../hooks/useApiQuery'
import { formatCurrency, formatDate } from '../../utils/format'
import { publicServicesService } from '../../features/services/servicesService'
import { publicStoreProductsService } from '../../features/storeProducts/storeProductsService'
import { publicBlogsService } from '../../features/blogs/blogsService'
import { publicFaqsService } from '../../features/faqs/faqsService'
import { cartService } from '../../features/cart/cartService'
import { checkoutService } from '../../features/checkout/checkoutService'
import { useAuthStore } from '../../stores/authStore'

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
        {['Thu lead tự động', 'Chốt đơn nhanh', 'Tích hợp n8n', 'Báo cáo realtime'].map((x) => (
          <div className="card price-card" key={x}><h3>✨ {x}</h3><p>Tối ưu toàn bộ hành trình khách hàng từ tin nhắn đầu tiên đến thanh toán.</p></div>
        ))}
      </div></section>

      <section className="section"><div className="container">
        <h2>Dịch vụ nổi bật</h2>
        <Spin spinning={servicesQ.loading}>
          {!services.length && !servicesQ.loading ? <Empty description="Chưa có dịch vụ" /> : (
            <div className="grid pricing">
              {services.map((s) => (
                <div className={'card price-card ' + (s.popular ? 'popular' : '')} key={s._id}>
                  <h3>{s.name}</h3><h2>{formatCurrency(s.price)}</h2>
                  <p>{s.description}</p>
                  <Link className="btn btn-primary" to={`/dich-vu/${s.slug || s._id}`}>Xem chi tiết</Link>
                </div>
              ))}
            </div>
          )}
        </Spin>
      </div></section>

      <section className="section"><div className="container">
        <h2>Blog mới nhất</h2>
        <Spin spinning={blogsQ.loading}>
          <div className="grid blog-grid">
            {blogs.map((b) => (
              <Link className="card price-card" to={`/blog/${b.slug || b._id}`} key={b._id}>
                <span className="badge processing">{b.category?.name || b.category || 'Blog'}</span>
                <h3>{b.title}</h3><p>{formatDate(b.publishedAt || b.createdAt)}</p>
              </Link>
            ))}
          </div>
        </Spin>
      </div></section>
    </>
  )
}

// ---- Blog -----------------------------------------------------------------
export function BlogPage() {
  const query = useApiQuery(() => publicBlogsService.getList({ limit: 30 }), [])
  const blogs = query.data?.items || []
  return (
    <main className="section"><div className="container">
      <h1>Blog LOSA247</h1>
      <Spin spinning={query.loading}>
        {!blogs.length && !query.loading ? <Empty description="Chưa có bài viết" /> : (
          <div className="grid blog-grid">
            {blogs.map((b) => (
              <Link className="card price-card" to={`/blog/${b.slug || b._id}`} key={b._id}>
                <div className="badge processing">{b.category?.name || b.category || 'Blog'}</div>
                <h3>{b.title}</h3><p>{formatDate(b.publishedAt || b.createdAt)}</p>
              </Link>
            ))}
          </div>
        )}
      </Spin>
    </div></main>
  )
}

export function BlogDetailPage() {
  const { id } = useParams()
  const query = useApiQuery(() => publicBlogsService.getBySlug(id), [id])
  const blog = query.data
  return (
    <main className="section"><article className="container card price-card">
      <Spin spinning={query.loading}>
        {!blog && !query.loading ? <Empty description="Không tìm thấy bài viết" /> : blog && (
          <>
            <div className="eyebrow">{blog.category?.name || blog.category || 'Blog'}</div>
            <h1>{blog.title}</h1>
            <p><small>{formatDate(blog.publishedAt || blog.createdAt)}</small></p>
            {/* Nội dung rich text: backend cần đảm bảo đã sanitize. */}
            <div dangerouslySetInnerHTML={{ __html: blog.content || '' }} />
          </>
        )}
      </Spin>
    </article></main>
  )
}

// ---- Services -------------------------------------------------------------
export function ServicesPage() {
  const query = useApiQuery(() => publicServicesService.getList({ limit: 50 }), [])
  const services = query.data?.items || []
  return (
    <main className="section"><div className="container">
      <h1>Dịch vụ AI Sales Agent</h1>
      <Spin spinning={query.loading}>
        {!services.length && !query.loading ? <Empty description="Chưa có dịch vụ" /> : (
          <div className="grid pricing">
            {services.map((s) => (
              <div className={'card price-card ' + (s.popular ? 'popular' : '')} key={s._id}>
                <h3>{s.name}</h3><h2>{formatCurrency(s.price)}</h2>
                <p>{s.description}</p>
                <Link className="btn btn-primary" to={`/dich-vu/${s.slug || s._id}`}>Xem chi tiết</Link>
              </div>
            ))}
          </div>
        )}
      </Spin>
    </div></main>
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
