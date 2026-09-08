import { CheckCircle2, ArrowRight, Bot, Sparkles, ShieldCheck, Clock3, MessagesSquare } from 'lucide-react'
import { Empty, Spin } from 'antd'
import { CheckCircleOutlined, CloseOutlined, RobotOutlined, CommentOutlined, ContactsOutlined, PartitionOutlined, LineChartOutlined, CustomerServiceOutlined } from '@ant-design/icons'
import { motion } from 'framer-motion'
import PricingSection from '../../components/client/pricing/PricingSection'
import { ClientFaqSection } from '../../components/client/ClientFaqSection'
import { useApiQuery } from '../../hooks/useApiQuery'
import { publicFaqsService } from '../../features/faqs/faqsService'
import { publicPricingService } from '../../features/services/pricingService'
import { useUIStore } from '../../stores/uiStore'
import { useI18n } from '../../hooks/useI18n'
import { PageSeo } from '../../components/seo/PageSeo'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55 } }
}

export function ServicesPage() {
  const { locale, t } = useI18n()
  const plansQuery = useApiQuery(() => publicPricingService.getPlans(locale), [locale])
  const compQuery = useApiQuery(() => publicPricingService.getComparisons(locale), [locale])
  const faqsQuery = useApiQuery(() => publicFaqsService.getList({ pageType: 'pricing' }, locale), [locale])
  const openLeadModal = useUIStore((state) => state.openLeadModal)

  const plans = plansQuery.data?.items || []
  const comparisons = compQuery.data?.items || []
  const faqs = faqsQuery.data?.items || []
  const activePlans = plans.filter((plan) => plan.isActive !== false).sort((a, b) => a.order - b.order)


  const scrollToPlans = () => document.getElementById('chatbot-pricing-plans')?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <main className="client-app-wrapper pricing-page">
      <PageSeo title={locale === 'en' ? 'AI Chatbot Pricing for Businesses' : 'Bảng giá Chatbot AI cho doanh nghiệp'} description={locale === 'en' ? 'Explore flexible Losa AI Chatbot plans with 24/7 automation, omnichannel support and scalable pricing.' : 'Khám phá các gói Chatbot AI Losa linh hoạt, hỗ trợ tư vấn tự động 24/7, kết nối đa kênh và tối ưu chi phí vận hành.'} />
      <section className="client-hero" aria-labelledby="pricing-hero-title">
        <div className="saas-container client-hero__grid">
          <motion.div className="client-hero__content" initial="hidden" animate="visible" variants={fadeUp}>
            <span className="client-hero__badge"><Sparkles size={14} /> {locale === 'en' ? 'Transparent pricing · Flexible deployment' : 'Bảng giá minh bạch · Triển khai linh hoạt'}</span>
            <h1 id="pricing-hero-title" className="client-hero__title">{locale === 'en' ? <>Choose the right <span>AI Chatbot</span> plan for your business</> : <>Chọn gói <span>Chatbot AI</span> phù hợp với doanh nghiệp</>}</h1>
            <p className="client-hero__lead">{locale === 'en' ? 'Automate consulting, support and sales 24/7 with a platform that scales through every stage of growth.' : 'Tự động hóa tư vấn, chăm sóc và bán hàng 24/7 với một nền tảng có thể mở rộng theo từng giai đoạn tăng trưởng.'}</p>
            <div className="client-hero__proof">
              <span><CheckCircle2 size={17} /> {locale === 'en' ? 'Omnichannel' : 'Kết nối đa kênh'}</span>
              <span><CheckCircle2 size={17} /> {locale === 'en' ? 'Cost optimized' : 'Tối ưu chi phí'}</span>
              <span><CheckCircle2 size={17} /> {locale === 'en' ? 'Implementation support' : 'Hỗ trợ triển khai'}</span>
            </div>
            <div className="client-hero__actions">
              <button id="pricing-hero-consult-btn" type="button" className="pricing-btn pricing-btn-primary" onClick={openLeadModal}>{locale === 'en' ? 'Get free advice' : 'Nhận tư vấn miễn phí'}</button>
            </div>
          </motion.div>

          <motion.div className="client-hero__visual pricing-hero-visual" initial={{ opacity: 0, x: 45 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.75 }} aria-hidden="true">
            <div className="pricing-visual-orbit" />
            <div className="pricing-bot-core"><Bot size={46} /><span>AI</span></div>
            <div className="pricing-float-card card-response"><Clock3 /><span><strong>24/7</strong>{locale === 'en' ? 'Instant responses' : 'Phản hồi tức thì'}</span></div>
            <div className="pricing-float-card card-channels"><MessagesSquare /><span><strong>{locale === 'en' ? 'Omnichannel' : 'Đa kênh'}</strong>{locale === 'en' ? 'Manage in one place' : 'Một nơi quản lý'}</span></div>
            <div className="pricing-float-card card-secure"><ShieldCheck /><span><strong>{locale === 'en' ? 'Secure' : 'An toàn'}</strong>{locale === 'en' ? 'Protected data' : 'Dữ liệu bảo mật'}</span></div>
          </motion.div>
        </div>
      </section>

      <section className="pricing-plans-section" id="chatbot-pricing-plans" aria-labelledby="pricing-plans-title">
        <div className="saas-fluid-container">
          <header className="pricing-section-heading">
            <span>{locale === 'en' ? 'Service plans' : 'Gói dịch vụ'}</span>
            <h2 id="pricing-plans-title">{locale === 'en' ? 'Choose a Chatbot plan that fits your needs' : 'Chọn gói Chatbot phù hợp với nhu cầu của bạn'}</h2>
            <p>{locale === 'en' ? 'Choose by connected channels, customer scale and the business features you need. Start free and upgrade as you grow.' : 'Lựa chọn theo số lượng kênh kết nối, quy mô khách hàng và tính năng doanh nghiệp cần sử dụng. Bạn có thể bắt đầu miễn phí và nâng cấp linh hoạt khi nhu cầu tăng lên.'}</p>
          </header>
          <Spin spinning={plansQuery.loading || compQuery.loading || faqsQuery.loading}>
            {!plans.length && !plansQuery.loading ? <Empty description={t('pricing.empty')} /> : (
              <>
                <PricingSection plans={plans} loading={plansQuery.loading} onConsult={openLeadModal} />
                {comparisons.length > 0 && (
                  <section className="pricing-comparison" aria-labelledby="pricing-comparison-title">
                    <header className="pricing-section-heading compact">
                      <span>{locale === 'en' ? 'Feature comparison' : 'So sánh tính năng'}</span>
                      <h2 id="pricing-comparison-title">{locale === 'en' ? 'Find the right plan faster' : 'Tìm gói phù hợp nhanh hơn'}</h2>
                      <p>{locale === 'en' ? 'Compare benefits and scalability across Losa Chatbot plans.' : 'Đối chiếu chi tiết quyền lợi và khả năng mở rộng giữa các gói Chatbot Losa.'}</p>
                    </header>
                    <div className="pricing-table-shell">
                      <table className="saas-comparison-table">
                        <thead><tr><th>{locale === 'en' ? 'Feature' : 'Tính năng'}</th>{activePlans.map((plan) => <th key={plan._id}>{plan.name}</th>)}</tr></thead>
                        <tbody>{comparisons.map((comparison) => (
                          <tr key={comparison._id}>
                            <td className="saas-td-feature-name">
                              {comparison.title.toLowerCase().includes('agent') && <RobotOutlined />}
                              {comparison.title.toLowerCase().includes('zalo') && <CommentOutlined />}
                              {comparison.title.toLowerCase().includes('crm') && <ContactsOutlined />}
                              {comparison.title.toLowerCase().includes('workflow') && <PartitionOutlined />}
                              {comparison.title.toLowerCase().includes('báo cáo') && <LineChartOutlined />}
                              {comparison.title.toLowerCase().includes('hỗ trợ') && <CustomerServiceOutlined />}
                              {!['agent', 'zalo', 'crm', 'workflow', 'báo cáo', 'hỗ trợ'].some((term) => comparison.title.toLowerCase().includes(term)) && <CheckCircleOutlined />}
                              <span>{comparison.title}</span>
                            </td>
                            {activePlans.map((plan) => <td key={plan._id}>{comparison.values?.[plan._id] === 'yes' || comparison.values?.[plan._id] === true ? <CheckCircleOutlined className="saas-icon-check" /> : comparison.values?.[plan._id] === 'no' || comparison.values?.[plan._id] === false ? <CloseOutlined className="saas-icon-close" /> : <span className="saas-text-value">{comparison.values?.[plan._id]}</span>}</td>)}
                          </tr>
                        ))}</tbody>
                      </table>
                    </div>
                  </section>
                )}
              </>
            )}
          </Spin>
        </div>
      </section>


      {faqs.length > 0 && <ClientFaqSection faqs={faqs} />}
    </main>
  )
}
