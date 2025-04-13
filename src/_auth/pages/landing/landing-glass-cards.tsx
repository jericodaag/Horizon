import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { glassFeatures } from '@/_auth/pages/data/glassFeatures';

interface LandingGlassCardsProps {
  hasIntersected: boolean;
  setupRef: (ref: HTMLElement | null) => void;
}

export const LandingGlassCards: React.FC<LandingGlassCardsProps> = ({
  hasIntersected,
  setupRef,
}) => {
  return (
    <section
      id='community'
      className='w-full bg-black relative overflow-hidden pb-24 sm:pb-36'
      ref={setupRef}
    >
      <div className='max-w-7xl mx-auto px-4 sm:px-6'>
        <div className='text-center mb-16'>
          <motion.p
            className='text-violet-400 text-sm font-medium mb-2'
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            PREMIUM FEATURES
          </motion.p>
          <motion.h2
            className='text-3xl sm:text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-white/90'
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            Advanced tools for creators
          </motion.h2>
          <motion.p
            className='text-gray-400 max-w-2xl mx-auto text-sm sm:text-base'
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            Take your content to the next level with our powerful creator tools
          </motion.p>
        </div>

        {hasIntersected && (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6'>
            {glassFeatures.map((feature, index) => (
              <motion.div
                key={index}
                className='frosted-glass rounded-xl overflow-hidden'
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 + index * 0.1 }}
                whileHover={{
                  y: -5,
                  scale: 1.02,
                  boxShadow: '0 15px 30px rgba(0,0,0,0.2)',
                  transition: { duration: 0.2 },
                }}
              >
                <div className='p-6 h-full flex flex-col'>
                  <div className='flex-none mb-4'>
                    <div className='w-12 h-12 rounded-full bg-white/10 flex items-center justify-center'>
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className='text-lg font-semibold mb-2'>
                    {feature.title}
                  </h3>
                  <p className='text-sm text-white/70 flex-grow'>
                    {feature.description}
                  </p>
                  <div className='mt-6 pt-4 border-t border-white/10 flex justify-between items-center'>
                    <span className='text-xs text-white/50'>
                      Premium Feature
                    </span>
                    <div className='w-8 h-8 rounded-full bg-white/10 flex items-center justify-center'>
                      <ArrowRight className='w-4 h-4 text-white/70' />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
