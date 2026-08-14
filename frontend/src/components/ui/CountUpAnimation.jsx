import { useState, useEffect, useRef } from 'react'

// ---- Components -------------------------------------------------------------

export function CountUpAnimation({ initialValue, targetValue, textAfter = "" }) {
  const [count, setCount] = useState(initialValue);
  const nodeRef = useRef(null);

  useEffect(() => {
    let startTime;
    const duration = 2000; // 2 seconds

    const updateCount = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      const easeProgress = percentage === 1 ? 1 : 1 - Math.pow(2, -10 * percentage);
      const current = Math.floor(initialValue + (targetValue - initialValue) * easeProgress);
      setCount(current);

      if (progress < duration) {
        requestAnimationFrame(updateCount);
      } else {
        setCount(targetValue);
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          requestAnimationFrame(updateCount);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (nodeRef.current) {
      observer.observe(nodeRef.current);
    }

    return () => observer.disconnect();
  }, [initialValue, targetValue]);

  return <span ref={nodeRef}>{count}{textAfter}</span>;
}

