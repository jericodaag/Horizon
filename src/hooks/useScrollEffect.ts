import { useState, useEffect } from 'react';

export const useScrollEffect = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  // Optimize scroll event listener with debounce
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const handleScroll = () => {
      if (timeoutId) {
        return;
      }

      timeoutId = setTimeout(() => {
        if (window.scrollY > 50) {
          setIsScrolled(true);
        } else {
          setIsScrolled(false);
        }
        timeoutId = null as unknown as ReturnType<typeof setTimeout>;
      }, 100); // Debounce by 100ms
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  return { isScrolled };
};
