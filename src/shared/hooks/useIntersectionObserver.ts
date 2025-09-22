import { useEffect, useRef, useState, RefObject } from 'react';

interface IntersectionObserverOptions {
  threshold?: number | number[];
  root?: Element | null;
  rootMargin?: string;
  freezeOnceVisible?: boolean;
}

/**
 * Hook to observe element intersection with viewport
 * @param options - Intersection observer options
 * @returns [ref, entry]
 */
export function useIntersectionObserver<T extends Element = HTMLDivElement>(
  options: IntersectionObserverOptions = {}
): [RefObject<T>, IntersectionObserverEntry | undefined] {
  const {
    threshold = 0,
    root = null,
    rootMargin = '0px',
    freezeOnceVisible = false,
  } = options;

  const elementRef = useRef<T>(null);
  const [entry, setEntry] = useState<IntersectionObserverEntry>();
  const frozen = useRef(false);

  useEffect(() => {
    const element = elementRef.current;
    const hasIOSupport = !!window.IntersectionObserver;

    if (!hasIOSupport || !element || (frozen.current && freezeOnceVisible)) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setEntry(entry);

        if (entry.isIntersecting && freezeOnceVisible) {
          frozen.current = true;
        }
      },
      { threshold, root, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, root, rootMargin, freezeOnceVisible]);

  return [elementRef, entry];
}

/**
 * Hook for lazy loading components when they become visible
 * @param options - Intersection observer options
 * @returns [ref, isVisible]
 */
export function useLazyLoad<T extends Element = HTMLDivElement>(
  options: IntersectionObserverOptions = {}
): [RefObject<T>, boolean] {
  const [ref, entry] = useIntersectionObserver<T>({
    ...options,
    freezeOnceVisible: true,
  });

  return [ref, !!entry?.isIntersecting];
}

/**
 * Hook for infinite scrolling
 * @param callback - Function to call when element is visible
 * @param options - Intersection observer options
 * @returns ref to attach to trigger element
 */
export function useInfiniteScroll<T extends Element = HTMLDivElement>(
  callback: () => void | Promise<void>,
  options: IntersectionObserverOptions = {}
): RefObject<T> {
  const [ref, entry] = useIntersectionObserver<T>(options);
  const callbackRef = useRef(callback);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (entry?.isIntersecting) {
      callbackRef.current();
    }
  }, [entry?.isIntersecting]);

  return ref;
}

/**
 * Hook to track element visibility percentage
 * @param options - Intersection observer options
 * @returns [ref, visibilityPercentage]
 */
export function useVisibilityPercentage<T extends Element = HTMLDivElement>(
  options: Omit<IntersectionObserverOptions, 'threshold'> = {}
): [RefObject<T>, number] {
  const [ref, entry] = useIntersectionObserver<T>({
    ...options,
    threshold: Array.from({ length: 101 }, (_, i) => i / 100),
  });

  const visibilityPercentage = entry ? Math.round(entry.intersectionRatio * 100) : 0;

  return [ref, visibilityPercentage];
}

/**
 * Hook to detect if element is sticky
 * @param options - Intersection observer options
 * @returns [ref, isSticky]
 */
export function useSticky<T extends Element = HTMLDivElement>(
  options: IntersectionObserverOptions = {}
): [RefObject<T>, boolean] {
  const [ref, entry] = useIntersectionObserver<T>({
    ...options,
    threshold: [1],
    rootMargin: '-1px 0px 0px 0px',
  });

  return [ref, entry ? !entry.isIntersecting : false];
}