import React, { useLayoutEffect } from 'react'
import { Empty, Spin } from 'antd'
import PricingCard from './PricingCard'

const PricingSection = ({ plans = [], loading = false, onConsult }) => {
  const activePlans = plans.filter((item) => item.isActive !== false).sort((a, b) => a.order - b.order)
  const gridRef = React.useRef(null)

  useLayoutEffect(() => {
    if (loading || activePlans.length === 0) return

    const syncHeights = () => {
      ['.saas-card-v2-header', '.saas-card-v2-desc'].forEach((selector) => {
        const elements = Array.from(gridRef.current?.querySelectorAll(selector) || [])
        if (!elements.length) return

        elements.forEach((element) => { element.style.minHeight = '0px' })
        const maxHeight = Math.max(...elements.map((element) => element.scrollHeight))
        elements.forEach((element) => { element.style.minHeight = `${maxHeight}px` })
      })
    }

    syncHeights()

    let lastWidth = -1
    const observer = new ResizeObserver((entries) => {
      const currentWidth = entries[0]?.contentRect.width
      if (currentWidth && currentWidth !== lastWidth) {
        lastWidth = currentWidth
        window.requestAnimationFrame(syncHeights)
      }
    })

    if (gridRef.current) observer.observe(gridRef.current)
    return () => observer.disconnect()
  }, [loading, activePlans.length])

  return (
    <Spin spinning={loading}>
      {!activePlans.length && !loading ? (
        <Empty description="Chưa có gói dịch vụ" />
      ) : (
        <div className="saas-pricing-grid-v2" ref={gridRef}>
          {activePlans.map((plan) => (
            <PricingCard key={plan._id} plan={plan} onConsult={onConsult} />
          ))}
        </div>
      )}
    </Spin>
  )
}

export default PricingSection
