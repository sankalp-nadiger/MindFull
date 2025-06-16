import { useMemo, useCallback, useState, useEffect } from 'react';

// Custom hook for memoizing expensive computations
export const useMemoizedValue = (factory, deps) => {
  return useMemo(factory, deps);
};

// Custom hook for memoizing callbacks
export const useMemoizedCallback = (callback, deps) => {
  return useCallback(callback, deps);
};

// Hook for debouncing values
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Hook for throttling functions
export const useThrottle = (callback, delay) => {
  const throttledCallback = useCallback(
    throttle(callback, delay),
    [callback, delay]
  );

  return throttledCallback;
};

// Throttle utility function
function throttle(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Hook for intersection observer (lazy loading)
export const useIntersectionObserver = (elementRef, options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    observer.observe(element);

    return () => observer.disconnect();
  }, [elementRef, options]);

  return isIntersecting;
};

export default {
  useMemoizedValue,
  useMemoizedCallback,
  useDebounce,
  useThrottle,
  useIntersectionObserver,
};
