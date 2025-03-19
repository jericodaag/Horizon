import { useState, useCallback, useRef, useEffect } from 'react';

type IntersectionState = Record<string, boolean>;

export const useIntersectionObserver = () => {
  const [hasIntersected, setHasIntersected] = useState<IntersectionState>({});
  const observersRef = useRef<Record<string, IntersectionObserver>>({});
  const elementsRef = useRef<Map<string, HTMLElement>>(new Map());

  const setupIntersectionObserver = useCallback(
    (id: string, threshold = 0.1) => {
      return (ref: HTMLElement | null) => {
        // Store the ref in our Map
        if (ref) {
          elementsRef.current.set(id, ref);
        } else {
          elementsRef.current.delete(id);
          return;
        }

        // Don't create observer if already intersected
        if (hasIntersected[id]) return;

        // Clean up any existing observer
        if (observersRef.current[id]) {
          observersRef.current[id].disconnect();
        }

        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                setHasIntersected((prev) => ({ ...prev, [id]: true }));
                if (observersRef.current[id]) {
                  observersRef.current[id].disconnect();
                  delete observersRef.current[id];
                }
              }
            });
          },
          { threshold }
        );

        observer.observe(ref);
        observersRef.current[id] = observer;
      };
    },
    [hasIntersected]
  );

  // Use effect for cleanup
  useEffect(() => {
    return () => {
      // Clean up all observers when component unmounts
      Object.values(observersRef.current).forEach((observer) => {
        observer.disconnect();
      });
      observersRef.current = {};
    };
  }, []);

  return {
    hasIntersected,
    setupIntersectionObserver,
  };
};
