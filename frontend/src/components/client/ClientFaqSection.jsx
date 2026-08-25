import React from 'react';
import { Collapse } from 'antd';
import { MessageCircleMore, ArrowRight, ChevronUp, ChevronDown } from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';
import { useI18n } from '../../hooks/useI18n';

export function ClientFaqSection({ 
  faqs = [], 
  eyebrowText,
  eyebrowIcon: EyebrowIcon = MessageCircleMore, 
  title,
  introText,
  className = ''
}) {
  const openLeadModal = useUIStore((state) => state.openLeadModal);
  const { locale } = useI18n();
  const copy = locale === 'en' ? {
    eyebrow: 'Answers from Losa', title: 'Frequently asked questions', intro: 'Quick answers about our solutions, implementation process and how Losa supports your digital transformation.', cta: 'Get a free consultation', empty: 'Information is being updated', emptyAnswer: 'Contact Losa for direct assistance.',
  } : {
    eyebrow: 'Giải đáp cùng Losa', title: 'Câu hỏi thường gặp', intro: 'Tìm hiểu nhanh về giải pháp, quy trình triển khai và cách Losa đồng hành cùng doanh nghiệp trong hành trình chuyển đổi số.', cta: 'Nhận tư vấn miễn phí', empty: 'Thông tin đang được cập nhật', emptyAnswer: 'Bạn có thể liên hệ Losa để được giải đáp trực tiếp.',
  };

  return (
    <section className={`saas-section home-faq-section ${className}`} aria-labelledby="home-faq-title">
      <div className="saas-container home-faq-layout">
        <div className="home-faq-intro">
          {(eyebrowText !== null) && (
            <span className="home-faq-eyebrow">
              {EyebrowIcon && <EyebrowIcon size={15} />} {eyebrowText || copy.eyebrow}
            </span>
          )}
          <h2 id="home-faq-title">{title || copy.title}</h2>
          {(introText || copy.intro) && <p>{introText || copy.intro}</p>}
          

          <button type="button" onClick={openLeadModal} className="home-faq-cta">
            {copy.cta} <ArrowRight size={17} />
          </button>
        </div>
        
        <div className="home-faq-accordion-wrap">
          <Collapse 
            className="home-faq-collapse" 
            accordion 
            ghost 
            expandIconPosition="end" 
            expandIcon={({ isActive }) => (
              <span className={`home-faq-toggle ${isActive ? 'active' : ''}`}>
                {isActive ? <ChevronUp size={18} strokeWidth={2.25} /> : <ChevronDown size={18} strokeWidth={2.25} />}
              </span>
            )} 
            items={faqs?.length ? faqs.map((faq, index) => ({ 
              key: faq._id, 
              label: (
                <span className="home-faq-question">
                  <span>{String(index + 1).padStart(2, '0')}</span>{faq.question}
                </span>
              ), 
              children: <p className="home-faq-answer">{faq.answer}</p> 
            })) : [{ 
              key: 'empty', 
              label: (
                <span className="home-faq-question">
                  <span>01</span>{copy.empty}
                </span>
              ), 
              children: <p className="home-faq-answer">{copy.emptyAnswer}</p> 
            }]} 
          />
        </div>
      </div>
    </section>
  );
}
