import { ArrowLeft, Home, SearchX } from 'lucide-react'
import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <main className="client-not-found" aria-labelledby="not-found-title">
      <div className="client-not-found-glow" aria-hidden="true" />
      <section className="client-not-found-card">
        <div className="client-not-found-code" aria-hidden="true">404</div>
        <span className="client-not-found-icon"><SearchX size={30} /></span>
        <h1 id="not-found-title">Trang này chưa sẵn sàng</h1>
        <p>Nội dung bạn đang tìm kiếm chưa được triển khai hoặc đường dẫn không còn tồn tại.</p>
        <div className="client-not-found-actions">
          <Link id="not-found-home-link" to="/" className="client-not-found-primary"><Home size={17} /> Về trang chủ</Link>
          <Link id="not-found-pricing-link" to="/bang-gia" className="client-not-found-secondary"><ArrowLeft size={17} /> Xem bảng giá</Link>
        </div>
      </section>
    </main>
  )
}
