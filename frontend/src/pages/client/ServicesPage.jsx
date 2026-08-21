import { useEffect } from 'react'
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

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55 } }
}

export function ServicesPage() {
  const plansQuery = useApiQuery(() => publicPricingService.getPlans(), [])
  const compQuery = useApiQuery(() => publicPricingService.getComparisons(), [])
  const faqsQuery = useApiQuery(() => publicFaqsService.getList({ pageType: 'pricing' }), [])
  const openLeadModal = useUIStore((state) => state.openLeadModal)

  const plans = plansQuery.data?.items || []
  const comparisons = compQuery.data?.items || []
  const faqs = faqsQuery.data?.items || []
  const activePlans = plans.filter((plan) => plan.isActive !== false).sort((a, b) => a.order - b.order)

  useEffect(() => {
    document.title = 'Bảng giá Chatbot AI cho doanh nghiệp | Losa'
    let meta = document.querySelector('meta[name="description"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.name = 'description'
      document.head.appendChild(meta)
    }
    meta.content = 'Khám phá các gói Chatbot AI Losa linh hoạt, hỗ trợ tư vấn tự động 24/7, kết nối đa kênh và tối ưu chi phí vận hành.'
  }, [])

  const scrollToPlans = () => document.getElementById('chatbot-pricing-plans')?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <main className="client-app-wrapper pricing-page">
      <section className="client-hero" aria-labelledby="pricing-hero-title">
        <div className="saas-container client-hero__grid">
          <motion.div className="client-hero__content" initial="hidden" animate="visible" variants={fadeUp}>
            <span className="client-hero__badge"><Sparkles size={14} /> Bảng giá minh bạch · Triển khai linh hoạt</span>
            <h1 id="pricing-hero-title" className="client-hero__title">Chọn gói <span>Chatbot AI</span> phù hợp với doanh nghiệp</h1>
            <p className="client-hero__lead">Tự động hóa tư vấn, chăm sóc và bán hàng 24/7 với một nền tảng có thể mở rộng theo từng giai đoạn tăng trưởng.</p>
            <div className="client-hero__proof">
              <span><CheckCircle2 size={17} /> Kết nối đa kênh</span>
              <span><CheckCircle2 size={17} /> Tối ưu chi phí</span>
              <span><CheckCircle2 size={17} /> Hỗ trợ triển khai</span>
            </div>
            <div className="client-hero__actions">
              <button id="pricing-view-plans-btn" type="button" className="pricing-btn pricing-btn-primary" onClick={scrollToPlans}>Xem các gói dịch vụ <ArrowRight size={18} /></button>
              <button id="pricing-hero-consult-btn" type="button" className="pricing-btn pricing-btn-secondary" onClick={openLeadModal}>Nhận tư vấn miễn phí</button>
            </div>
          </motion.div>

          <motion.div className="client-hero__visual pricing-hero-visual" initial={{ opacity: 0, x: 45 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.75 }} aria-hidden="true">
            <div className="pricing-visual-orbit" />
            <div className="pricing-bot-core"><Bot size={46} /><span>AI</span></div>
            <div className="pricing-float-card card-response"><Clock3 /><span><strong>24/7</strong>Phản hồi tức thì</span></div>
            <div className="pricing-float-card card-channels"><MessagesSquare /><span><strong>Đa kênh</strong>Một nơi quản lý</span></div>
            <div className="pricing-float-card card-secure"><ShieldCheck /><span><strong>An toàn</strong>Dữ liệu bảo mật</span></div>
          </motion.div>
        </div>
      </section>

      <section className="pricing-plans-section" id="chatbot-pricing-plans" aria-labelledby="pricing-plans-title">
        <div className="saas-fluid-container">
          <header className="pricing-section-heading">
            <span>Gói dịch vụ</span>
            <h2 id="pricing-plans-title">Chọn gói Chatbot phù hợp với nhu cầu của bạn</h2>
            <p>Lựa chọn theo số lượng kênh kết nối, quy mô khách hàng và tính năng doanh nghiệp cần sử dụng. Bạn có thể bắt đầu miễn phí và nâng cấp linh hoạt khi nhu cầu tăng lên.</p>
          </header>
          <Spin spinning={plansQuery.loading || compQuery.loading || faqsQuery.loading}>
            {!plans.length && !plansQuery.loading ? <Empty description="Chưa có gói dịch vụ" /> : (
              <>
                <PricingSection plans={plans} loading={plansQuery.loading} onConsult={openLeadModal} />
                {comparisons.length > 0 && (
                  <section className="pricing-comparison" aria-labelledby="pricing-comparison-title">
                    <header className="pricing-section-heading compact">
                      <span>So sánh tính năng</span>
                      <h2 id="pricing-comparison-title">Tìm gói phù hợp nhanh hơn</h2>
                      <p>Đối chiếu chi tiết quyền lợi và khả năng mở rộng giữa các gói Chatbot Losa.</p>
                    </header>
                    <div className="pricing-table-shell">
                      <table className="saas-comparison-table">
                        <thead><tr><th>Tính năng</th>{activePlans.map((plan) => <th key={plan._id}>{plan.name}</th>)}</tr></thead>
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
