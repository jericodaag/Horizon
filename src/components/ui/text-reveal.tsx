import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TextRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  gradient?: {
    from: string;
    to: string;
  };
  threshold?: number;
}

export const TextReveal: React.FC<TextRevealProps> = ({
  children,
  className,
  delay = 0,
  duration = 1.5,
  gradient = {
    from: 'from-violet-600',
    to: 'to-indigo-500',
  },
  threshold = 0.5,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold]);

  const textVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      filter: 'blur(10px)',
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration,
        delay,
        ease: [0.2, 0.65, 0.3, 0.9],
      },
    },
  };

  const maskVariants = {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
      transition: {
        duration: duration * 1.5,
        delay: delay + duration * 0.5,
        ease: [0.2, 0.65, 0.3, 0.9],
      },
    },
  };

  return (
    <div ref={ref} className={cn('relative overflow-hidden', className)}>
      <motion.div
        initial='hidden'
        animate={isInView ? 'visible' : 'hidden'}
        variants={textVariants}
      >
        <motion.div
          className={cn(
            'relative inline-block bg-gradient-to-r bg-clip-text text-transparent',
            gradient.from,
            gradient.to
          )}
          initial='hidden'
          animate={isInView ? 'visible' : 'hidden'}
          variants={maskVariants}
        >
          {children}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default TextReveal;
