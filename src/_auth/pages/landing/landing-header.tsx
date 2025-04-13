import React from 'react';
import { motion } from 'framer-motion';

interface LandingHeaderProps {
  isScrolled: boolean;
  headerRef: React.RefObject<HTMLDivElement>;
  topSectionRef: React.RefObject<HTMLElement>;
}

export const LandingHeader: React.FC<LandingHeaderProps> = ({
  isScrolled,
  headerRef,
  topSectionRef,
}) => {
  return (
    <header
      ref={headerRef}
      className={`w-full py-4 px-6 fixed top-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-black/80 backdrop-blur-md border-b border-white/5'
          : 'bg-transparent'
      }`}
    >
      <nav className='flex justify-between items-center max-w-[1400px] mx-auto w-full'>
        <h1
          className='text-3xl font-inter font-bold tracking-tight cursor-pointer'
          onClick={() => {
            topSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          HORIZON
        </h1>

        {/* Modern Navigation - Desktop */}
        <div className='hidden md:flex items-center gap-8'>
          <div className='flex items-center space-x-6'>
            <a
              href='#features'
              className='text-sm text-white/80 hover:text-white transition-colors duration-200'
            >
              Features
            </a>
            <a
              href='#feature-carousel'
              className='text-sm text-white/80 hover:text-white transition-colors duration-200'
            >
              Explore
            </a>
            <a
              href='#feature-grid'
              className='text-sm text-white/80 hover:text-white transition-colors duration-200'
            >
              Discover
            </a>
          </div>

          <div className='flex gap-3 items-center'>
            <motion.button
              onClick={() => (window.location.href = '/sign-in')}
              className='text-white px-4 py-1.5 rounded-full border border-white/10 hover:border-white/30 transition-all duration-200 text-sm font-medium'
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Sign In
            </motion.button>

            <motion.button
              onClick={() => (window.location.href = '/sign-up')}
              className='relative px-5 py-1.5 rounded-full overflow-hidden group'
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className='absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 opacity-100 group-hover:opacity-90 transition-opacity'></span>
              <span className='relative z-10 text-white font-medium text-sm'>
                Join Now
              </span>
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation Toggle */}
        <div className='md:hidden'>
          <motion.button
            className='w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10'
            whileTap={{ scale: 0.9 }}
          >
            <svg
              width='18'
              height='12'
              viewBox='0 0 18 12'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                d='M1 1H17M1 6H17M1 11H17'
                stroke='white'
                strokeWidth='2'
                strokeLinecap='round'
              />
            </svg>
          </motion.button>
        </div>
      </nav>
    </header>
  );
};
