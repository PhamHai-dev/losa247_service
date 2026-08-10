import React from 'react';
import { Rocket, BriefcaseBusiness, Building2, CheckCircle } from "lucide-react";

const getIcon = (order) => {
  if (order === 1) return <Rocket size={24} color="#16A34A" />;
  if (order === 2) return <BriefcaseBusiness size={24} color="#16A34A" />;
  return <Building2 size={24} color="#16A34A" />;
};

const PricingCard = ({ plan }) => {
  const features = plan.feature || plan.features || [];
  const subtitles = plan.subtitle || [];
  
  return (
    <div className="saas-card-v2">
      {/* Top Section */}
      <div className="saas-card-v2-top-section">
        {/* Header */}
        <div className="saas-card-v2-header">
          <div className="saas-card-v2-icon-wrap">
            {getIcon(plan.order)}
          </div>
          <div className="saas-card-v2-title">
            {plan.name}
          </div>
          {plan.badge && (
            <div className="saas-card-v2-badge">
              {plan.badge}
            </div>
          )}
        </div>

        {/* Price */}
        <div className="saas-card-v2-price-wrap">
          <div className="saas-card-v2-price">
            {plan.price || 'Liên hệ báo giá'}
          </div>
        </div>

        {/* Description */}
        <div className="saas-card-v2-desc">
          {subtitles.map((desc, idx) => (
            <p key={idx}>{desc}</p>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="saas-card-v2-divider"></div>

      {/* Features */}
      <ul className="saas-card-v2-features">
        {features.map((item, idx) => (
          <li key={idx}>
            <CheckCircle size={20} color="#16A34A" style={{ flexShrink: 0 }} />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      {/* Button */}
      <div className="saas-card-v2-btn-wrap">
        <button className="saas-card-v2-btn">
          {plan.buttonText || 'Tư vấn miễn phí'}
        </button>
      </div>
    </div>
  );
};

export default PricingCard;
