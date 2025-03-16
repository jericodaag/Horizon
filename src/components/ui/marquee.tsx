import React, { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface MarqueeProps {
  className?: string;
  pauseOnHover?: boolean;
  reverse?: boolean;
  children: React.ReactNode;
}

export const Marquee = ({
  className,
  pauseOnHover = false,
  reverse = false,
  children,
}: MarqueeProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [duration, setDuration] = useState(20); // Default duration in seconds
  const [isPaused, setIsPaused] = useState(false);

  // Set the animation direction and duration
  useEffect(() => {
    if (containerRef.current) {
      const scrollWidth = containerRef.current.scrollWidth;
      const viewWidth = containerRef.current.offsetWidth;

      // Calculate duration based on content length (longer content = longer duration)
      if (scrollWidth > viewWidth) {
        const calculatedDuration = Math.max(20, scrollWidth / 50);
        setDuration(calculatedDuration);
      }
    }
  }, [children]);

  return (
    <div className={cn('flex overflow-hidden w-full relative', className)}>
      <div
        ref={containerRef}
        onMouseEnter={() => pauseOnHover && setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className='flex gap-4 whitespace-nowrap animate-marquee'
        style={{
          animationDirection: reverse ? 'reverse' : 'normal',
          animationDuration: `${duration}s`,
          animationPlayState: isPaused ? 'paused' : 'running',
          // Custom animation using inline style
          animationName: 'marquee-scroll',
          animationTimingFunction: 'linear',
          animationIterationCount: 'infinite',
        }}
      >
        {/* First copy of content */}
        {children}

        {/* Duplicate the content to create a seamless loop */}
        <div className='flex gap-4'>{children}</div>
      </div>

      {/* Add a style block for the animation */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
    @keyframes marquee-scroll {
      0% {
        transform: translateX(0);
      }
      100% {
        transform: translateX(calc(-50% - 0.5rem)); /* Adjust based on your gap */
      }
    }
  `,
        }}
      />
    </div>
  );
};

export default Marquee;
