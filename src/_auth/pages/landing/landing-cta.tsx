import React from 'react';
import { motion } from 'framer-motion';

export const LandingCTA: React.FC = () => {
  return (
    <section className='w-full py-20 sm:py-28 bg-black relative overflow-hidden'>
      <div className='absolute inset-0 overflow-hidden'>
        <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/20 rounded-full filter blur-[120px]'></div>
        <div className='absolute top-1/2 left-1/2 -translate-x-[60%] -translate-y-[40%] w-[300px] h-[300px] bg-indigo-500/15 rounded-full filter blur-[80px]'></div>
      </div>

      <div className="absolute inset-0 bg-[url('/assets/grid-pattern.svg')] bg-repeat opacity-5"></div>

      <div className='max-w-6xl mx-auto px-4 sm:px-6 relative z-10'>
        <div className='flex flex-col items-center'>
          <motion.div
            className='relative mb-10 w-full max-w-sm mx-auto'
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <motion.div
              className='relative z-10 p-2'
              animate={{
                y: [0, -8, 0],
                rotateZ: [0, 1, 0],
                rotateX: [0, 2, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <img
                src='/assets/images/cta.png'
                alt='Horizon Platform'
                className='drop-shadow-2xl relative z-10'
              />

              <div
                className='absolute top-1/4 left-1/4 w-2 h-2 bg-violet-300 rounded-full animate-ping opacity-70'
                style={{ animationDuration: '1.5s', animationDelay: '0.2s' }}
              ></div>
              <div
                className='absolute top-1/3 right-1/3 w-1 h-1 bg-indigo-300 rounded-full animate-ping opacity-70'
                style={{ animationDuration: '2s', animationDelay: '0.5s' }}
              ></div>
              <div
                className='absolute bottom-1/3 left-1/3 w-1.5 h-1.5 bg-fuchsia-300 rounded-full animate-ping opacity-70'
                style={{ animationDuration: '3s', animationDelay: '0.3s' }}
              ></div>
              <div
                className='absolute top-2/3 right-1/4 w-1 h-1 bg-purple-300 rounded-full animate-ping opacity-70'
                style={{ animationDuration: '2.5s', animationDelay: '0.7s' }}
              ></div>
              <div
                className='absolute bottom-1/4 right-1/3 w-2 h-2 bg-violet-300 rounded-full animate-ping opacity-70'
                style={{ animationDuration: '2.8s', animationDelay: '1s' }}
              ></div>

              <motion.div
                className='absolute -top-4 -right-2 w-3 h-3 bg-white rounded-full'
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0.8, 1.2, 0.8],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0.5,
                }}
              />
              <motion.div
                className='absolute top-1/2 -left-3 w-2 h-2 bg-white rounded-full'
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0.8, 1.2, 0.8],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 1.2,
                }}
              />

              <div className='absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-12 bg-gradient-to-t from-violet-500/20 to-transparent blur-md rounded-full'></div>
            </motion.div>
          </motion.div>

          <motion.div
            className='text-center max-w-2xl mx-auto'
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h2 className='text-3xl sm:text-5xl font-bold mb-4 tracking-tight leading-tight'>
              Step into the
              <motion.span
                className='text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-300 to-indigo-500 ml-2'
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                style={{
                  backgroundSize: '200% 200%',
                }}
              >
                future of social
              </motion.span>
            </h2>

            <p className='text-base text-white/70 mb-6 max-w-xl mx-auto leading-relaxed'>
              Join thousands of creators and teams using Horizon to turn ideas
              into high-performing social platforms, faster than ever before.
            </p>

            <div className='flex flex-col sm:flex-row gap-4 justify-center'>
              <motion.button
                onClick={() => (window.location.href = '/sign-up')}
                className='relative inline-flex h-12 overflow-hidden rounded-full p-[1px] focus:outline-none w-full sm:w-auto'
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <span className='absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]' />
                <span className='inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-8 py-3 text-base font-medium text-white backdrop-blur-3xl'>
                  Join Now
                </span>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
