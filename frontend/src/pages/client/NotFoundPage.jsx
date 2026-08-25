import { ArrowLeft, Home, SearchX } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useI18n } from '../../hooks/useI18n'
import { PageSeo } from '../../components/seo/PageSeo'

export function NotFoundPage() {
  const { locale, t, localizedPath } = useI18n()
  const en = locale === 'en'
  return (
    <main className="client-not-found" aria-labelledby="not-found-title">
      <PageSeo title={t('errors.notFound')} description={en ? 'The requested page could not be found.' : 'Không tìm thấy nội dung hoặc đường dẫn bạn yêu cầu.'} noIndex />
      <div className="client-not-found-glow" aria-hidden="true" />
      <section className="client-not-found-card">
        <div className="client-not-found-code" aria-hidden="true">404</div>
        <span className="client-not-found-icon"><SearchX size={30} /></span>
        <h1 id="not-found-title">{en ? 'This page is not available' : 'Trang này chưa sẵn sàng'}</h1>
        <p>{en ? 'The content you are looking for has not been published or the address no longer exists.' : 'Nội dung bạn đang tìm kiếm chưa được triển khai hoặc đường dẫn không còn tồn tại.'}</p>
        <div className="client-not-found-actions">
          <Link id="not-found-home-link" to={localizedPath('/')} className="client-not-found-primary"><Home size={17} /> {en ? 'Back to home' : 'Về trang chủ'}</Link>
          <Link id="not-found-pricing-link" to={localizedPath('/bang-gia')} className="client-not-found-secondary"><ArrowLeft size={17} /> {en ? 'View pricing' : 'Xem bảng giá'}</Link>
        </div>
      </section>
    </main>
  )
}
