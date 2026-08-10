import React, { useLayoutEffect } from 'react';
import { Empty, Spin } from 'antd';
import { useApiQuery } from '../../../hooks/useApiQuery';
import { publicPricingService } from '../../../features/services/pricingService';
import PricingCard from './PricingCard';

const PricingSection = () => {
  const plansQuery = useApiQuery(() => publicPricingService.getPlans(), []);

  const plans = plansQuery.data?.items || [];
  const activePlans = plans.filter(item => item.isActive).sort((a, b) => a.order - b.order);

  useLayoutEffect(() => {
    if (plansQuery.loading || activePlans.length === 0) return;

    const syncHeights = () => {
      ['.saas-card-v2-header', '.saas-card-v2-desc'].forEach(selector => {
        const elements = Array.from(document.querySelectorAll(selector));
        if (!elements.length) return;
        
        // Reset minHeight to measure natural content
        elements.forEach(el => el.style.minHeight = '0px');
        
        // Find max natural height
        const maxHeight = Math.max(...elements.map(el => el.scrollHeight));
        
        // Apply max height
        elements.forEach(el => el.style.minHeight = `${maxHeight}px`);
      });
    };

    // Run synchronously before the browser paints the screen
    syncHeights();

    // Run robustly on window/container resize
    let lastWidth = -1;
    const observer = new ResizeObserver((entries) => {
      const currentWidth = entries[0]?.contentRect.width;
      if (currentWidth && currentWidth !== lastWidth) {
        lastWidth = currentWidth;
        // Dùng requestAnimationFrame để không bị ResizeObserver loop error
        window.requestAnimationFrame(syncHeights);
      }
    });

    const grid = document.querySelector('.saas-pricing-grid-v2');
    if (grid) observer.observe(grid);

    return () => observer.disconnect();
  }, [plansQuery.loading, activePlans.length]);

  return (
    <Spin spinning={plansQuery.loading}>
      {!activePlans.length && !plansQuery.loading ? (
        <Empty description="Chưa có gói dịch vụ" />
      ) : (
        <div className="saas-pricing-grid-v2">
          {activePlans.map((plan) => (
            <PricingCard key={plan._id} plan={plan} />
          ))}
        </div>
      )}
    </Spin>
  );
};

export default PricingSection;
