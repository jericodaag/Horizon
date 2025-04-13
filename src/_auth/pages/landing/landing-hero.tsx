import React from 'react';
import { motion } from 'framer-motion';
import { TextGenerateEffect } from '@/components/ui/text-generate-effect';
import { SimplifiedBackground } from '@/components/ui/simplified-background';
import { TypewriterEffect } from '@/components/ui/typewriter';
import { typewriterWords } from '@/_auth/pages/data/typewriterWords';

interface LandingHeroProps {
  topSectionRef: React.RefObject<HTMLElement>;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ topSectionRef }) => {
  return (
    <section
      ref={topSectionRef}
      className='relative min-h-screen flex items-center justify-center overflow-hidden'
    >
      <div className='absolute inset-0 z-0'>
        <SimplifiedBackground />
      </div>

      <div className='relative z-20 text-center px-4 max-w-5xl mx-auto flex flex-col min-h-screen'>
        <div className='flex-grow flex flex-col items-center justify-center'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className='mb-6 flex items-center justify-center'
          >
            <h1 className='text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/70 px-2 sm:px-4'>
              <TypewriterEffect words={typewriterWords} />
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className='mt-6 sm:mt-8 max-w-3xl mx-auto'
          >
            <div className='text-lg sm:text-xl text-white/80 mb-10'>
              <TextGenerateEffect words='Join millions of creators sharing their moments, connecting with others, and building their digital legacy through the power of visual storytelling.' />
            </div>

            <div className='mt-8 sm:mt-10 flex justify-center'>
              <motion.button
                onClick={() => (window.location.href = '/sign-up')}
                className='relative inline-flex h-14 overflow-hidden rounded-full p-[1px] focus:outline-none w-full sm:w-auto'
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <span className='absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]' />
                <span className='inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-8 py-4 text-base font-medium text-white backdrop-blur-3xl'>
                  Get Started
                </span>
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Social proof - Positioned at bottom */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className='mt-auto mb-10 flex flex-col items-center'
        >
          <p className='text-white/50 text-sm mb-4'>
            Trusted by creators worldwide
          </p>
          <div className='flex items-center justify-center'></div>
        </motion.div>
      </div>
    </section>
  );
};
