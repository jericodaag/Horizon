import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useGetRecentPosts } from '@/lib/react-query/queries';
import { TypewriterEffect } from '@/components/ui/typewriter';
import { HeroParallax } from '@/components/ui/hero-parallax';
import { TextGenerateEffect } from '@/components/ui/text-generate-effect';
import { SimplifiedBackground } from '@/components/ui/simplified-background';
import { InfiniteMovingCards } from '@/components/ui/infinite-moving-cards';

const LandingPage: React.FC = () => {
  const { data: posts } = useGetRecentPosts();
  const [isScrolled, setIsScrolled] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  // Transform posts into products format for HeroParallax
  const parallaxProducts = posts?.documents?.map(post => ({
    title: post.caption || post.creator?.name || 'Horizon Post',
    thumbnail: post.imageUrl
  })) || [];

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

  // Text for text generation effect
  const generateText = "Join millions of creators sharing their moments, connecting with others, and building their digital legacy through the power of visual storytelling.";

  // Testimonial cards for infinite moving cards
  const testimonials = [
    {
      quote: "Horizon has completely transformed how I share my photography with the world.",
      name: "John Pingul",
      title: "Professional Photographer",
    },
    {
      quote: "The connections I've made through this platform have been incredible. Best community ever!",
      name: "Elmalia Diaz",
      title: "Content Creator",
    },
    {
      quote: "This platform has helped me grow my audience by 300% in just three months.",
      name: "Richard Darwin",
      title: "Influencer",
    },
    {
      quote: "I love the clean interface and how easy it is to share my daily experiences.",
      name: "Paul Santos",
      title: "Travel Blogger",
    },
    {
      quote: "The engagement on my posts here is way higher than on any other platform I've used.",
      name: "Ranielle Tuazon",
      title: "Digital Artist",
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

  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className='w-full min-h-screen bg-black text-white font-inter overflow-x-hidden'>
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

      {/* Hero Section with Simplified Background */}
      <SimplifiedBackground>
        <div className="relative z-20 text-center px-4">
          <div className="mb-6 flex items-center justify-center">
            <h1 className="text-5xl md:text-7xl font-bold text-center text-white">
              <TypewriterEffect words={words} />
            </h1>
          </div>

          <div className="mt-8 max-w-3xl mx-auto">
            <TextGenerateEffect words={generateText} />
            <div className="mt-10">
              {/* Restored animated gradient button */}
              <button
                onClick={() => (window.location.href = '/sign-up')}
                className="relative inline-flex h-12 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
              >
                <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
                <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-8 py-3 text-sm font-medium text-white backdrop-blur-3xl">
                  Get Started
                </span>
              </button>
            </div>
          </div>
        </div>
      </SimplifiedBackground>

      {/* Hero Parallax Section - integrate with content sections */}
      {parallaxProducts.length > 0 && (
        <HeroParallax products={parallaxProducts} />
      )}

      {/* Testimonials - Infinite Moving Cards */}
      <div className="relative flex flex-col items-center justify-center bg-black overflow-hidden py-20">
        <h2 className="text-3xl md:text-5xl font-bold text-center text-white mb-8">
          What Our Users Say
        </h2>
        <div className="relative w-full max-w-[1400px] mx-auto">
          <InfiniteMovingCards
            items={testimonials}
            direction="right"
            speed="slow"
          />
        </div>
      </div>

      {/* Content Sections - positioned to flow right after parallax effect */}
      <div className='bg-black'>
        {/* Features Section */}
        <section className='w-full px-6 py-20 relative z-10 bg-black/30 backdrop-blur-sm'>
          <div className='max-w-[1400px] mx-auto'>
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-100px" }}
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
                  className='text-center p-8 rounded-2xl transition-all duration-500 group hover:bg-white/5'
                >
                  <div className="relative mx-auto mb-4 w-12 h-12 flex items-center justify-center rounded-full bg-violet-500/20 text-violet-500 group-hover:bg-violet-500 group-hover:text-white transition-all duration-300">
                    {index === 0 ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    ) : index === 1 ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    )}
                  </div>
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