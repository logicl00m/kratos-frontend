import { useEffect, useCallback, useRef } from 'react';

/**
 * Hook to measure component render performance
 * @param componentName Name of the component for logging
 */
export function useRenderMetrics(componentName: string) {
  const renderCount = useRef(0);
  const renderTime = useRef<number>(0);

  useEffect(() => {
    renderCount.current += 1;
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      renderTime.current = endTime - startTime;

      if (process.env.NODE_ENV === 'development') {
        console.log(`[${componentName}] Render #${renderCount.current}: ${renderTime.current.toFixed(2)}ms`);
      }
    };
  });

  return {
    renderCount: renderCount.current,
    lastRenderTime: renderTime.current,
  };
}

/**
 * Hook to throttle a callback function
 * @param callback The callback to throttle
 * @param delay The throttle delay in milliseconds
 */
export function useThrottle<Args extends unknown[]>(
  callback: (...args: Args) => void,
  delay: number = 100
): (...args: Args) => void {
  const lastRun = useRef(Date.now());
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const throttledCallback = useCallback(
    (...args: Args) => {
      const now = Date.now();

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      if (now - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = now;
      } else {
        timeoutRef.current = setTimeout(() => {
          callback(...args);
          lastRun.current = Date.now();
        }, delay - (now - lastRun.current));
      }
    },
    [callback, delay]
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return throttledCallback;
}

/**
 * Hook to detect and warn about unnecessary re-renders
 * @param props Component props to track
 * @param name Component name for logging
 */
export function useWhyDidYouUpdate<T extends Record<string, unknown>>(
  props: T,
  name: string
) {
  const previousProps = useRef<T>();

  useEffect(() => {
    if (previousProps.current && process.env.NODE_ENV === 'development') {
      const allKeys = Object.keys({ ...previousProps.current, ...props });
      const changedProps: Partial<T> = {};

      allKeys.forEach((key) => {
        if (previousProps.current![key] !== props[key]) {
          changedProps[key as keyof T] = {
            from: previousProps.current![key],
            to: props[key],
          } as T[keyof T];
        }
      });

      if (Object.keys(changedProps).length > 0) {
        console.log(`[${name}] Props changed:`, changedProps);
      }
    }

    previousProps.current = props;
  });
}

/**
 * Hook to measure Web Vitals
 */
export function useWebVitals(onReport?: (metric: any) => void) {
  useEffect(() => {
    const reportWebVitals = async () => {
      if ('web-vital' in window) return;

      try {
        const { getCLS, getFID, getFCP, getLCP, getTTFB } = await import('web-vitals');

        getCLS(onReport || console.log);
        getFID(onReport || console.log);
        getFCP(onReport || console.log);
        getLCP(onReport || console.log);
        getTTFB(onReport || console.log);
      } catch (error) {
        console.error('Failed to load web-vitals', error);
      }
    };

    reportWebVitals();
  }, [onReport]);
}

/**
 * Hook to lazy load images with Intersection Observer
 * @param src Image source URL
 * @param placeholder Placeholder image URL
 */
export function useLazyImage(src: string, placeholder?: string) {
  const [imageSrc, setImageSrc] = useState(placeholder || '');
  const [isLoading, setIsLoading] = useState(true);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = new Image();
            img.src = src;
            img.onload = () => {
              setImageSrc(src);
              setIsLoading(false);
            };
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [src]);

  return { imageSrc, isLoading, imgRef };
}

/**
 * Hook to defer non-critical operations
 * @param callback The callback to defer
 */
export function useIdleCallback(callback: () => void) {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const id = requestIdleCallback(() => {
      callbackRef.current();
    });

    return () => cancelIdleCallback(id);
  }, []);
}

import { useState } from 'react';

// Polyfill for requestIdleCallback
if (!window.requestIdleCallback) {
  window.requestIdleCallback = function(callback: IdleRequestCallback) {
    const start = Date.now();
    return setTimeout(() => {
      callback({
        didTimeout: false,
        timeRemaining: () => Math.max(0, 50 - (Date.now() - start)),
      } as IdleDeadline);
    }, 1) as unknown as number;
  };
}

if (!window.cancelIdleCallback) {
  window.cancelIdleCallback = function(id: number) {
    clearTimeout(id);
  };
}