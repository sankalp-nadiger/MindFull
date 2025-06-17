import { useEffect } from 'react';

const PerformanceMonitor = () => {
  useEffect(() => {
    // Performance monitoring
    if ('performance' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            console.log('Page Load Time:', entry.loadEventEnd - entry.loadEventStart);
          }
          if (entry.entryType === 'largest-contentful-paint') {
            console.log('LCP:', entry.startTime);
          }
          if (entry.entryType === 'first-input') {
            console.log('FID:', entry.processingStart - entry.startTime);
          }
          if (entry.entryType === 'layout-shift') {
            if (!entry.hadRecentInput) {
              console.log('CLS:', entry.value);
            }
          }
        }
      });

      try {
        observer.observe({ entryTypes: ['navigation', 'largest-contentful-paint', 'first-input', 'layout-shift'] });
      } catch (e) {
        // Fallback for older browsers
        console.log('Performance observer not supported');
      }

      // Cleanup
      return () => {
        observer.disconnect();
      };
    }
  }, []);

  return null;
};

export default PerformanceMonitor;
