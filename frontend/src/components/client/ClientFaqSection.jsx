import React from 'react';
import { Collapse } from 'antd';
import { MessageCircleMore, Headset, ArrowRight, ChevronUp, ChevronDown } from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';

export function ClientFaqSection({ 
  faqs = [], 
  eyebrowText = 'Giải đáp cùng Losa', 
  eyebrowIcon: EyebrowIcon = MessageCircleMore, 
  title = 'Câu hỏi thường gặp', 
  introText = 'Tìm hiểu nhanh về giải pháp, quy trình triển khai và cách Losa đồng hành cùng doanh nghiệp trong hành trình chuyển đổi số.', 
  showAssurance = true,
  className = ''
}) {
  const openLeadModal = useUIStore((state) => state.openLeadModal);

  return (
    <section className={`saas-section home-faq-section ${className}`} aria-labelledby="home-faq-title">
      <div className="saas-container home-faq-layout">
        <div className="home-faq-intro">
          {eyebrowText && (
            <span className="home-faq-eyebrow">
              {EyebrowIcon && <EyebrowIcon size={15} />} {eyebrowText}
            </span>
          )}
          <h2 id="home-faq-title">{title}</h2>
          {introText && <p>{introText}</p>}
          
          {showAssurance && (
            <div className="home-faq-assurance">
              <span className="home-faq-assurance-icon"><Headset size={24} /></span>
              <div>
                <strong>Bạn cần tư vấn thêm?</strong>
                <span>Đội ngũ Losa luôn sẵn sàng lắng nghe bài toán của doanh nghiệp.</span>
              </div>
            </div>
          )}
          
          <button type="button" onClick={openLeadModal} className="home-faq-cta">
            Nhận tư vấn miễn phí <ArrowRight size={17} />
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
                {isActive ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
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
                  <span>01</span>Thông tin đang được cập nhật
                </span>
              ), 
              children: <p className="home-faq-answer">Bạn có thể liên hệ Losa để được giải đáp trực tiếp.</p> 
            }]} 
          />
        </div>
      </div>
    </section>
  );
}
