import React, { useState, useRef } from 'react';
import { useIntersectionObserver } from '../../hooks/usePerformance';

const LazyLoadWrapper = ({ 
  children, 
  fallback = null, 
  threshold = 0.1, 
  rootMargin = '50px' 
}) => {
  const [hasLoaded, setHasLoaded] = useState(false);
  const elementRef = useRef();
  
  const isIntersecting = useIntersectionObserver(elementRef, {
    threshold,
    rootMargin,
  });

  React.useEffect(() => {
    if (isIntersecting && !hasLoaded) {
      setHasLoaded(true);
    }
  }, [isIntersecting, hasLoaded]);

  return (
    <div ref={elementRef}>
      {hasLoaded ? children : fallback}
    </div>
  );
};

export default LazyLoadWrapper;
