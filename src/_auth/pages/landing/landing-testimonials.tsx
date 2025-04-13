import React, { Suspense } from 'react';
import { motion } from 'framer-motion';
import LoadingFallback from '@/components/ui/loading-fallback';
import { testimonials } from '@/_auth/pages/data/testimonials';

// Lazy load heavy components
const InfiniteMovingCards = React.lazy(() =>
  import('@/components/ui/infinite-moving-cards').then((module) => ({
    default: module.InfiniteMovingCards,
  }))
);

interface LandingTestimonialsProps {
  hasIntersected: boolean;
  setupRef: (ref: HTMLElement | null) => void;
}

export const LandingTestimonials: React.FC<LandingTestimonialsProps> = ({
  hasIntersected,
  setupRef,
}) => {
  return (
    <section
      className='relative flex flex-col items-center justify-center bg-black overflow-hidden py-24 mb-0'
      ref={setupRef}
    >
      <div className='max-w-7xl mx-auto px-4 sm:px-6 text-center mb-12'>
        <motion.p
          className='text-violet-400 text-sm font-medium mb-2'
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          TESTIMONIALS
        </motion.p>
        <motion.h2
          className='text-3xl sm:text-4xl md:text-5xl font-bold mb-4'
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          What Our Users Say
        </motion.h2>
        <motion.p
          className='text-gray-400 max-w-2xl mx-auto text-sm sm:text-base'
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          Join thousands of satisfied creators already growing on Horizon
        </motion.p>
      </div>
      <div className='relative w-full max-w-[1200px] mx-auto'>
        {hasIntersected && (
          <Suspense fallback={<LoadingFallback />}>
            <InfiniteMovingCards
              items={testimonials}
              direction='right'
              speed='slow'
            />
          </Suspense>
        )}
      </div>
    </section>
  );
};
