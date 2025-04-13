import React, { Suspense } from 'react';
import { motion } from 'framer-motion';
import LoadingFallback from '@/components/ui/loading-fallback';

// Lazy load heavy components
const HeroParallax = React.lazy(() =>
  import('@/components/ui/hero-parallax').then((module) => ({
    default: module.HeroParallax,
  }))
);

interface Product {
  title: string;
  thumbnail: string;
}

interface LandingParallaxProps {
  products: Product[];
  hasIntersected: boolean;
  setupRef: (ref: HTMLElement | null) => void;
}

export const LandingParallax: React.FC<LandingParallaxProps> = ({
  products,
  hasIntersected,
  setupRef,
}) => {
  return (
    <section ref={setupRef} className='w-full bg-black relative'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 mb-16'>
        <div className='text-center mb-12'>
          <motion.p
            className='text-violet-400 text-sm font-medium mb-2'
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            EXPLORE CONTENT
          </motion.p>
          <motion.h2
            className='text-3xl sm:text-4xl md:text-5xl font-bold mb-4'
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            Discover trending posts
          </motion.h2>
          <motion.p
            className='text-gray-400 max-w-2xl mx-auto text-sm sm:text-base'
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            See what creators are sharing on Horizon right now
          </motion.p>
        </div>
      </div>

      {hasIntersected && products.length > 0 && (
        <Suspense fallback={<LoadingFallback />}>
          <HeroParallax products={products} />
        </Suspense>
      )}
    </section>
  );
};
