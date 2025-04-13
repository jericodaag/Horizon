import React, { Suspense } from 'react';
import { motion } from 'framer-motion';
import LoadingFallback from '@/components/ui/loading-fallback';
import { features } from '@/_auth/pages/data/features';

// Lazy load heavy components
const BentoGrid = React.lazy(() =>
  import('@/components/ui/bento-grid').then((module) => ({
    default: module.BentoGrid,
  }))
);
const BentoCard = React.lazy(() =>
  import('@/components/ui/bento-grid').then((module) => ({
    default: module.BentoCard,
  }))
);

interface LandingBentoGridProps {
  hasIntersected: boolean;
  setupRef: (ref: HTMLElement | null) => void;
}

export const LandingBentoGrid: React.FC<LandingBentoGridProps> = ({
  hasIntersected,
  setupRef,
}) => {
  return (
    <section
      id='feature-grid'
      className='w-full px-6 py-24 bg-black relative'
      ref={setupRef}
    >
      <div className='max-w-[1400px] mx-auto'>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className='text-center mb-16'
        >
          <motion.p
            className='text-violet-400 text-sm font-medium mb-2'
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            PLATFORM HIGHLIGHTS
          </motion.p>
          <motion.h2
            className='text-3xl sm:text-4xl md:text-5xl font-bold mb-4'
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            Discover What Horizon Offers
          </motion.h2>
          <motion.p
            className='text-gray-400 max-w-2xl mx-auto text-sm sm:text-base'
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            A modern social platform with all the features you need to connect,
            share, and grow your online presence
          </motion.p>
        </motion.div>

        {hasIntersected && (
          <div className='mb-16 px-2 sm:px-0'>
            <Suspense fallback={<LoadingFallback />}>
              <BentoGrid>
                {features.map((feature, idx) => (
                  <BentoCard key={idx} {...feature} />
                ))}
              </BentoGrid>
            </Suspense>
          </div>
        )}
      </div>
    </section>
  );
};
