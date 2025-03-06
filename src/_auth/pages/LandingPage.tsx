import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useGetRecentPosts } from '@/lib/react-query/queries';
import { TypewriterEffect } from '@/components/ui/typewriter';

interface CursorProps {
  position: { x: number; y: number };
}

const CustomCursor: React.FC<CursorProps> = ({ position }) => (
  <div
    className='fixed top-0 left-0 w-4 h-4 border border-white rounded-full pointer-events-none z-[100] mix-blend-difference'
    style={{
      transform: `translate(${position.x - 8}px, ${position.y - 8}px)`,
    }}
  />
);

const LandingPage: React.FC = () => {
  const { data: posts } = useGetRecentPosts();
  const [isScrolled, setIsScrolled] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const progressRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  // Typewriter effect words
  const words = [
    {
      text: "Share ",
    },
    {
      text: "Your ",
    },
    {
      text: "Story ",
      className: "text-violet-500",
    },
  ];

  // Custom scrollbar styles
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      ::-webkit-scrollbar {
        width: 10px;
        background: #000000;
      }
      ::-webkit-scrollbar-thumb {
        background: #333;
        border-radius: 10px;
      }
      ::-webkit-scrollbar-thumb:hover {
        background: #444;
      }
      html {
        scroll-behavior: smooth;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Handle cursor movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Direct position update without any smoothing
      setCursorPos({
        x: e.clientX,
        y: e.clientY,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Update progress bar
  useEffect(() => {
    const updateProgress = () => {
      if (progressRef.current) {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const scrolled = window.scrollY;
        const progress = (scrolled / (documentHeight - windowHeight)) * 100;
        progressRef.current.style.width = `${progress}%`;
      }
    };

    window.addEventListener('scroll', updateProgress);
    updateProgress();
    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

  return (
    <div className='w-full min-h-screen bg-black text-white font-inter overflow-x-hidden landing-page-cursor'>
      {/* Custom Cursor */}
      <CustomCursor position={cursorPos} />

      {/* Progress bar */}
      <div className='fixed top-0 left-0 w-full h-[2px] bg-white/20 z-50'>
        <div
          ref={progressRef}
          className='h-full bg-white transition-all duration-150 ease-out'
          style={{ width: '0%' }}
        />
      </div>

      {/* Header */}
      <header
        ref={headerRef}
        className={`w-full py-4 px-6 fixed top-0 z-40 transition-all duration-500 ${isScrolled ? 'bg-black/80 backdrop-blur-sm' : 'bg-transparent'
          }`}
      >
        <nav className='flex justify-between items-center max-w-[1400px] mx-auto w-full'>
          <h1 className='text-3xl font-inter font-bold tracking-tight'>
            HORIZON
          </h1>
          <div className='flex gap-6 items-center'>
            <button
              onClick={() => (window.location.href = '/sign-in')}
              className='text-white hover:text-gray-300 transition-colors font-inter relative group'
            >
              <span>Sign In</span>
              <span className='absolute bottom-0 left-0 w-0 h-px bg-white group-hover:w-full transition-all duration-300' />
            </button>
            <button
              onClick={() => (window.location.href = '/sign-up')}
              className='relative px-6 py-2 rounded-full font-inter overflow-hidden bg-white group'
            >
              <span className='relative z-10 text-black group-hover:text-white transition-colors duration-300'>
                Join Now
              </span>
              <div className='absolute inset-0 bg-black transform scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-300' />
            </button>
          </div>
        </nav>
      </header>

      {/* Hero Video Section */}
      <section className='h-screen w-full relative overflow-hidden'>
        {/* Video Background */}
        <div className='absolute inset-0'>
          <video
            autoPlay
            loop
            muted
            playsInline
            className='w-full h-full object-cover opacity-40'
          >
            <source src='/public/assets/images/bg-vid.mp4' type='video/mp4' />
          </video>
          <div className='absolute inset-0 backdrop-blur-[1px]' />
        </div>

        {/* Hero Content */}
        <div className='relative h-full w-full flex items-center justify-center px-6'>
          <div className='text-center max-w-3xl mx-auto'>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              {/* Typewriter Effect for the heading */}
              <div className="mb-6 flex justify-center">
                <TypewriterEffect words={words} />
              </div>

              <p className='text-gray-400 text-xl mb-12 font-inter leading-relaxed'>
                Join millions of creators sharing their moments, connecting with
                others, and building their digital legacy through the power of
                visual storytelling.
              </p>
              <button
                onClick={() => (window.location.href = '/sign-up')}
                className='relative px-8 py-4 rounded-full font-inter overflow-hidden bg-white group'
              >
                <span className='relative z-10 text-black group-hover:text-white transition-colors duration-300'>
                  Get Started
                </span>
                <div className='absolute inset-0 bg-black transform scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-300' />
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Content Sections with Black Background */}
      <div className='bg-black'>
        {/* Grid Section */}
        <section className='w-full px-6 py-20 relative z-10'>
          <div className='max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {posts?.documents.map((post, index) => (
              <motion.div
                key={post.$id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`relative group ${index % 5 === 0 ? 'md:col-span-2 md:row-span-2' : ''
                  }`}
              >
                <img
                  src={post.imageUrl}
                  alt={post.caption}
                  className='w-full h-full object-cover aspect-square'
                />
                <div className='absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center'>
                  <div className='text-center p-6'>
                    <h3 className='text-xl font-bold mb-2'>
                      {post.creator.name}
                    </h3>
                    <p className='text-gray-200'>{post.caption}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section className='w-full px-6 py-20 relative z-10 bg-black/30 backdrop-blur-sm'>
          <div className='max-w-[1400px] mx-auto'>
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className='text-5xl font-bold text-center mb-20 font-inter tracking-tight'
            >
              Express Yourself
            </motion.h2>
            <div className='grid md:grid-cols-3 gap-12'>
              {[
                {
                  title: 'Share Stories',
                  description:
                    'Share your daily moments through photos and stories',
                },
                {
                  title: 'Connect',
                  description:
                    'Build meaningful connections with creators worldwide',
                },
                {
                  title: 'Grow',
                  description:
                    'Develop your personal brand and reach new audiences',
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className='text-center p-8 rounded-2xl transition-all duration-500'
                >
                  <h3 className='text-2xl font-bold mb-4 font-inter'>
                    {feature.title}
                  </h3>
                  <p className='text-gray-400 font-inter leading-relaxed'>
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className='w-full px-6 py-12 relative z-10 bg-black/40 backdrop-blur-sm'>
          <div className='max-w-[1400px] mx-auto text-center'>
            <p className='text-gray-400 font-inter'>
              © {new Date().getFullYear()} Horizon. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;