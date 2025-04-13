import React, { Suspense } from 'react';
import { motion } from 'framer-motion';
import LoadingFallback from '@/components/ui/loading-fallback';
import { TechStackMarquee } from '@/components/ui/tech-stack-marquee';

interface LandingTechStackProps {
  hasIntersected: boolean;
  setupRef: (ref: HTMLElement | null) => void;
}

export const LandingTechStack: React.FC<LandingTechStackProps> = ({
  hasIntersected,
  setupRef,
}) => {
  return (
    <section
      className='relative py-10 sm:py-16 pb-0 overflow-hidden bg-black'
      ref={setupRef}
    >
      <div className='max-w-7xl mx-auto px-4 sm:px-6 text-center'>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className='mb-8'
        >
          <Suspense fallback={<LoadingFallback />}>
            <h2 className='text-3xl sm:text-4xl md:text-5xl font-bold mb-4 px-4 text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-indigo-600'>
              Built With Modern Technologies
            </h2>
          </Suspense>
          <motion.p
            className='text-gray-400 max-w-2xl mx-auto px-2 sm:px-4 text-sm sm:text-base'
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            Horizon leverages the latest web technologies to provide a seamless,
            fast, and engaging social media experience
          </motion.p>
        </motion.div>

        <div className='relative mb-0'>
          <Suspense fallback={<LoadingFallback />}>
            {hasIntersected && <TechStackMarquee />}
          </Suspense>
        </div>
      </div>
    </section>
  );
};
