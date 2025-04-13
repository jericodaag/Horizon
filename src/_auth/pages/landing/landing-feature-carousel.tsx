import React, { Suspense } from 'react';
import { motion } from 'framer-motion';
import LoadingFallback from '@/components/ui/loading-fallback';
import { carouselItems } from '@/_auth/pages/data/carouselItems';

// Lazy load
const AppleCardsCarousel = React.lazy(() =>
  import('@/components/ui/apple-card-carousel').then((module) => ({
    default: module.AppleCardsCarousel,
  }))
);

interface LandingFeatureCarouselProps {
  hasIntersected: boolean;
  setupRef: (ref: HTMLElement | null) => void;
}

export const LandingFeatureCarousel: React.FC<LandingFeatureCarouselProps> = ({
  hasIntersected,
  setupRef,
}) => {
  return (
    <section
      id='feature-carousel'
      className='w-full py-20 sm:py-28 bg-black relative overflow-hidden'
      ref={setupRef}
    >
      <div className='max-w-6xl mx-auto px-4 sm:px-6'>
        <div className='text-center sm:text-left mb-12 sm:mb-16'>
          <motion.p
            className='text-violet-400 text-sm font-medium mb-2'
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            EXPERIENCE
          </motion.p>
          <motion.h2
            className='text-3xl sm:text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-white/90'
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            Explore Horizon features
          </motion.h2>
          <motion.p
            className='text-gray-400 max-w-2xl mx-auto sm:mx-0 text-sm sm:text-base'
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            Discover how Horizon empowers creators and communities
          </motion.p>
        </div>

        {hasIntersected && (
          <Suspense fallback={<LoadingFallback />}>
            <AppleCardsCarousel items={carouselItems} />
          </Suspense>
        )}
      </div>
    </section>
  );
};
