import { Rocket, BriefcaseBusiness, Building2, CheckCircle2, ArrowRight } from 'lucide-react'

const getIcon = (order) => {
  if (order === 1) return <Rocket size={23} />
  if (order === 2) return <BriefcaseBusiness size={23} />
  return <Building2 size={23} />
}

const normalizeStringList = (value) => {
  if (Array.isArray(value)) return value
  if (typeof value !== 'string' || !value.trim()) return []

  try {
    const parsed = JSON.parse(value)
    if (Array.isArray(parsed)) return parsed
  } catch {
    // Dữ liệu cũ có thể được lưu dưới dạng chuỗi nhiều dòng thay vì JSON.
  }

  return value.split(/\r?\n|;/).map((item) => item.trim()).filter(Boolean)
}

const PricingCard = ({ plan, onConsult }) => {
  const features = normalizeStringList(plan.feature ?? plan.features)
  const subtitles = normalizeStringList(plan.subtitle)
  const isFeatured = Boolean(plan.badge)
  const planId = String(plan._id || plan.order || plan.name).replace(/[^a-zA-Z0-9-_]/g, '-')

  return (
    <article className={`saas-card-v2 ${isFeatured ? 'is-featured' : ''}`}>
      <div className="saas-card-v2-top-section">
        <div className="saas-card-v2-header">
          <div className="saas-card-v2-icon-wrap">{getIcon(plan.order)}</div>
          <div className="saas-card-v2-title">{plan.name}</div>
          {plan.badge && <div className="saas-card-v2-badge">{plan.badge}</div>}
        </div>

        <div className="saas-card-v2-price-wrap">
          <div className="saas-card-v2-price">{plan.price || 'Liên hệ báo giá'}</div>
        </div>

        <div className="saas-card-v2-desc">
          {subtitles.map((desc, index) => <p key={index}>{desc}</p>)}
        </div>
      </div>

      <div className="saas-card-v2-divider" />
      <p className="saas-card-v2-feature-label">Gói dịch vụ bao gồm</p>
      <ul className="saas-card-v2-features">
        {features.map((item, index) => (
          <li key={index}><CheckCircle2 size={19} /><span>{item}</span></li>
        ))}
      </ul>

      <div className="saas-card-v2-btn-wrap">
        <button id={`pricing-card-consult-${planId}`} type="button" className="saas-card-v2-btn" onClick={onConsult} aria-label={`${plan.buttonText || 'Tư vấn miễn phí'} cho gói ${plan.name}`}>
          {plan.buttonText || 'Tư vấn miễn phí'} <ArrowRight size={17} />
        </button>
      </div>
    </article>
  )
}

export default PricingCard
