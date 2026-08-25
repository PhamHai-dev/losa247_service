import { Link } from 'react-router-dom'
import { Result } from 'antd'
import { useAuthStore } from '../../stores/authStore'
import { useI18n } from '../../hooks/useI18n'
import { PageSeo } from '../../components/seo/PageSeo'

export function AccountPage() {
  const { user } = useAuthStore()
  const { locale, t, localizedPath } = useI18n()
  const en = locale === 'en'
  return (
    <main className="section">
      <PageSeo title={t('account.title')} description={en ? 'View your Losa247 customer account information.' : 'Xem thông tin tài khoản khách hàng Losa247.'} />
      <div className="container card price-card">
        <h1>{t('account.title')}</h1>
        {user ? (
          <>
            <p><b>{en ? 'Full name' : 'Họ tên'}:</b> {user.name}</p>
            <p><b>Email:</b> {user.email}</p>
            {user.phone && <p><b>{en ? 'Phone' : 'SĐT'}:</b> {user.phone}</p>}
            {/* Order history requires the client GET /orders endpoint — see API_ADDITIONS.md. */}
            <p style={{ opacity: 0.7 }}>{en ? 'Order history will appear when the client GET /orders endpoint is available.' : 'Lịch sử đơn hàng sẽ hiển thị khi backend bổ sung GET /orders (client).'}</p>
          </>
        ) : (
          <Result status="info" title={en ? 'You are not logged in' : 'Bạn chưa đăng nhập'} extra={<Link className="btn btn-primary" to={localizedPath('/dang-nhap')}>{t('navigation.login')}</Link>} />
        )}
      </div>
    </main>
  )
}

// ---- Cart -----------------------------------------------------------------
