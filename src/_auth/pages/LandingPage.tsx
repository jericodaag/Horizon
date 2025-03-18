import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useGetRecentPosts } from '@/lib/react-query/queries';
import { HeroParallax } from '@/components/ui/hero-parallax';
import { TextGenerateEffect } from '@/components/ui/text-generate-effect';
import { SimplifiedBackground } from '@/components/ui/simplified-background';
import { InfiniteMovingCards } from '@/components/ui/infinite-moving-cards';
import { BentoGrid, BentoCard } from '@/components/ui/bento-grid';
import { Marquee } from '@/components/ui/marquee';
import { SimpleCalendar } from '@/components/ui/simple-calendar';
import { IconCloud } from '@/components/ui/icon-cloud';
import { TextReveal } from '@/components/ui/text-reveal';
import { FeatureCard } from '@/components/ui/feature-card';
import { TypewriterEffect } from '@/components/ui/typewriter';
import { cn } from '@/lib/utils';

// Icons
import {
  MessageCircle,
  Camera,
  Compass,
  Heart,
  User,
  Bookmark,
  Search,
  Award,
  Globe,
} from 'lucide-react';

// Custom MorphingText component with proper TypeScript types
interface MorphingTextProps {
  texts: string[];
  className?: string;
  fontSize?: string;
  mobileSize?: string;
  tabletSize?: string;
}

const useMorphingText = (texts: string[]) => {
  const textIndexRef = useRef<number>(0);
  const morphRef = useRef<number>(0);
  const cooldownRef = useRef<number>(0);
  const timeRef = useRef<Date>(new Date());
  const text1Ref = useRef<HTMLSpanElement | null>(null);
  const text2Ref = useRef<HTMLSpanElement | null>(null);
  const morphTime = 1.5;
  const cooldownTime = 0.5;

  const setStyles = useCallback(
    (fraction: number) => {
      const current1 = text1Ref.current;
      const current2 = text2Ref.current;

      if (!current1 || !current2) return;

      current2.style.filter = `blur(${Math.min(8 / fraction - 8, 100)}px)`;
      current2.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;

      const invertedFraction = 1 - fraction;
      current1.style.filter = `blur(${Math.min(8 / invertedFraction - 8, 100)}px)`;
      current1.style.opacity = `${Math.pow(invertedFraction, 0.4) * 100}%`;

      current1.textContent = texts[textIndexRef.current % texts.length];
      current2.textContent = texts[(textIndexRef.current + 1) % texts.length];
    },
    [texts]
  );

  const doMorph = useCallback(() => {
    morphRef.current -= cooldownRef.current;
    cooldownRef.current = 0;
    let fraction = morphRef.current / morphTime;
    if (fraction > 1) {
      cooldownRef.current = cooldownTime;
      fraction = 1;
    }
    setStyles(fraction);
    if (fraction === 1) {
      textIndexRef.current++;
    }
  }, [setStyles]);

  const doCooldown = useCallback(() => {
    morphRef.current = 0;
    const current1 = text1Ref.current;
    const current2 = text2Ref.current;

    if (current1 && current2) {
      current2.style.filter = 'none';
      current2.style.opacity = '100%';
      current1.style.filter = 'none';
      current1.style.opacity = '0%';
    }
  }, []);

  useEffect(() => {
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const newTime = new Date();
      const dt = (newTime.getTime() - timeRef.current.getTime()) / 1000;
      timeRef.current = newTime;
      cooldownRef.current -= dt;
      if (cooldownRef.current <= 0) doMorph();
      else doCooldown();
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [doMorph, doCooldown]);

  return { text1Ref, text2Ref };
};

const MorphingText: React.FC<MorphingTextProps> = ({
  texts,
  className,
  fontSize = 'text-4xl',
  mobileSize = 'text-3xl',
  tabletSize = 'text-5xl',
}) => {
  const { text1Ref, text2Ref } = useMorphingText(texts);

  return (
    <div
      className={cn(
        `relative mx-auto h-12 w-full max-w-screen-md text-center font-sans ${mobileSize} ${tabletSize} md:${fontSize} font-bold leading-none [filter:url(#threshold)_blur(0.6px)]`,
        className
      )}
    >
      <span
        className='absolute inset-x-0 top-0 m-auto inline-block w-full'
        ref={text1Ref}
      />
      <span
        className='absolute inset-x-0 top-0 m-auto inline-block w-full'
        ref={text2Ref}
      />
      <svg
        id='filters'
        className='fixed h-0 w-0'
        preserveAspectRatio='xMidYMid slice'
      >
        <defs>
          <filter id='threshold'>
            <feColorMatrix
              in='SourceGraphic'
              type='matrix'
              values='1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 255 -140'
            />
          </filter>
        </defs>
      </svg>
    </div>
  );
};

// Types for features
interface Feature {
  Icon: React.FC<{ className?: string }>;
  name: string;
  description: string;
  href?: string;
  cta?: string;
  className?: string;
  background?: React.ReactNode;
}

// Type for testimonials
interface Testimonial {
  quote: string;
  name: string;
  title: string;
}

// Type for trending topics
interface TrendingTopic {
  name: string;
  body: string;
}

const LandingPage = () => {
  const { data: posts } = useGetRecentPosts();
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const aboutSectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: aboutSectionRef,
    offset: ['start end', 'end start'],
  });

  const topSectionRef = useRef<HTMLElement>(null);

  const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 0.5], [100, 0]);

  // Transform posts into products format for HeroParallax
  const parallaxProducts =
    posts?.documents?.map((post) => ({
      title: post.caption || post.creator?.name || 'Horizon Post',
      thumbnail: post.imageUrl,
    })) || [];

  // Typewriter effect words
  const words = [
    {
      text: 'Share ',
    },
    {
      text: 'Your ',
    },
    {
      text: 'Story ',
      className: 'text-violet-500',
    },
  ];

  // Morphing text phrases for Express Yourself section
  const expressYourselfPhrases = [
    'Express Yourself',
    'Be Authentic',
    'Tell Your Story',
    'Share Your Vision',
  ];

  // Testimonial cards for infinite moving cards
  const testimonials: Testimonial[] = [
    {
      quote:
        'Horizon has completely transformed how I share my photography with the world.',
      name: 'John Pingul',
      title: 'Professional Photographer',
    },
    {
      quote:
        "The connections I've made through this platform have been incredible. Best community ever!",
      name: 'Elmalia Diaz',
      title: 'Content Creator',
    },
    {
      quote:
        'This platform has helped me grow my audience by 300% in just three months.',
      name: 'Richard Darwin',
      title: 'Influencer',
    },
    {
      quote:
        'I love the clean interface and how easy it is to share my daily experiences.',
      name: 'Paul Santos',
      title: 'Travel Blogger',
    },
    {
      quote:
        "The engagement on my posts here is way higher than on any other platform I've used.",
      name: 'Ranielle Tuazon',
      title: 'Digital Artist',
    },
  ];

  // Sample content for Marquee component
  const trendingTopics: TrendingTopic[] = [
    {
      name: '#photography',
      body: 'Stunning landscapes and portraits from creators around the world',
    },
    {
      name: '#foodie',
      body: 'Delicious culinary creations and recipes to try at home',
    },
    {
      name: '#travel',
      body: 'Explore breathtaking destinations and travel tips from globe-trotters',
    },
    {
      name: '#fitness',
      body: 'Workout routines, nutrition advice, and fitness journeys',
    },
    {
      name: '#fashion',
      body: 'Latest trends, outfit inspirations, and style guides',
    },
  ];

  // Features for Bento grid
  const features: Feature[] = [
    {
      Icon: Camera,
      name: 'Create Posts',
      description:
        'Share your photos and moments with creators around the world.',
      href: '/sign-in',
      cta: 'Try it out',
      className: 'col-span-3 lg:col-span-1',
      background: (
        <Marquee
          pauseOnHover
          className='absolute top-10 [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)]'
        >
          {trendingTopics.map((topic, idx) => (
            <figure
              key={idx}
              className={cn(
                'relative w-32 cursor-pointer overflow-hidden rounded-xl border p-4',
                'border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]',
                'dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]',
                'transform-gpu blur-[1px] transition-all duration-300 ease-out hover:blur-none'
              )}
            >
              <div className='flex flex-row items-center gap-2'>
                <div className='flex flex-col'>
                  <figcaption className='text-sm font-medium dark:text-white'>
                    {topic.name}
                  </figcaption>
                </div>
              </div>
              <blockquote className='mt-2 text-xs'>{topic.body}</blockquote>
            </figure>
          ))}
        </Marquee>
      ),
    },
    {
      Icon: Heart,
      name: 'Engage With Content',
      description:
        'Like, comment and save your favorite posts for later viewing.',
      href: '/sign-in',
      cta: 'Learn more',
      className: 'col-span-3 lg:col-span-2',
      background: (
        <div className='absolute right-5 top-10 [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)]'>
          <div className='grid grid-cols-2 gap-4'>
            {[...Array(4)].map((_, idx) => (
              <div
                key={idx}
                className='w-24 h-24 rounded-lg bg-gradient-to-br from-purple-500/30 to-blue-500/30 flex items-center justify-center'
              >
                <Heart className='w-8 h-8 text-white/70' />
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      Icon: Compass,
      name: 'Discover Content',
      description: 'Find new creators and content tailored to your interests.',
      href: '/sign-in',
      cta: 'Explore now',
      className: 'col-span-3 lg:col-span-2',
      background: (
        <div className='absolute right-5 top-10 grid grid-cols-3 gap-2 [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)]'>
          {[...Array(6)].map((_, idx) => (
            <div
              key={idx}
              className='w-16 h-16 rounded-md bg-gradient-to-br from-indigo-500/20 to-purple-500/20'
            />
          ))}
        </div>
      ),
    },
    {
      Icon: MessageCircle,
      name: 'Connect',
      description: 'Chat with friends and create meaningful connections.',
      className: 'col-span-3 lg:col-span-1',
      href: '/sign-in',
      cta: 'Start chatting',
      background: (
        <SimpleCalendar
          selected={new Date()}
          className='absolute right-0 top-10 origin-top scale-75 transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)] group-hover:scale-90'
        />
      ),
    },
  ];

  // Features for second Bento grid
  const advancedFeatures: Feature[] = [
    {
      Icon: User,
      name: 'Profile Customization',
      description: 'Create a unique profile that showcases your personality.',
      href: '/sign-in',
      cta: 'Customize now',
      className: 'col-span-3 lg:col-span-2',
      background: (
        <div className='absolute right-10 top-10 w-16 h-16 rounded-full bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30 flex items-center justify-center'>
          <User className='w-8 h-8 text-white/70' />
        </div>
      ),
    },
    {
      Icon: () => (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10"></path>
          <path d="M12 2a15.3 15.3 0 0 0-4 10 15.3 15.3 0 0 0 4 10"></path>
          <path d="M2 12h20"></path>
        </svg>
      ),
      name: 'Multilingual Support',
      description: 'Translate content into over 100 languages powered by Google Cloud.',
      href: '/sign-in',
      cta: 'Try translations',
      className: 'col-span-3 lg:col-span-1',
      background: (
        <div className='absolute inset-0 overflow-hidden'>
          <div className='absolute top-6 left-3 text-xs opacity-10 text-blue-300 font-bold'>こんにちは</div>
          <div className='absolute top-12 left-10 text-xs opacity-10 text-indigo-300 font-bold'>Bonjour</div>
          <div className='absolute top-4 right-5 text-xs opacity-10 text-purple-300 font-bold'>안녕하세요</div>
          <div className='absolute bottom-12 left-6 text-xs opacity-10 text-sky-300 font-bold'>Hola</div>
          <div className='absolute bottom-6 right-12 text-xs opacity-10 text-violet-300 font-bold'>Guten Tag</div>
          <div className='absolute bottom-16 right-3 text-xs opacity-10 text-blue-300 font-bold'>Привет</div>
          <div className='absolute top-18 left-18 text-xs opacity-10 text-indigo-300 font-bold'>مرحبا</div>
        </div>
      ),
    },
    {
      Icon: Bookmark,
      name: 'Collections',
      description: 'Organize saved posts into custom collections.',
      href: '/sign-in',
      cta: 'Create collection',
      className: 'col-span-3 lg:col-span-1',
      background: (
        <div className='absolute right-5 top-10 grid grid-cols-2 gap-2'>
          {[...Array(4)].map((_, idx) => (
            <div
              key={idx}
              className='w-12 h-12 rounded-md bg-gradient-to-br from-amber-500/20 to-orange-500/20'
            />
          ))}
        </div>
      ),
    },
    {
      Icon: () => (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5"
        >
          <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
          <path d="M9.9 8.7h-2a.7.7 0 0 0-.7.7v5.2a.7.7 0 0 0 .7.7h2a.7.7 0 0 0 .7-.7V9.4a.7.7 0 0 0-.7-.7Z"></path>
          <path d="M16.7 8.7h-2a.7.7 0 0 0-.7.7v5.2a.7.7 0 0 0 .7.7h2a.7.7 0 0 0 .7-.7V9.4a.7.7 0 0 0-.7-.7Z"></path>
        </svg>
      ),
      name: 'GIF Support',
      description: 'Express yourself with GIFs in comments powered by GIPHY integration.',
      href: '/sign-in',
      cta: 'Try GIFs',
      className: 'col-span-3 lg:col-span-2',
      background: (
        <div className='absolute inset-0 overflow-hidden'>
          <div className='absolute inset-0 opacity-20'>
            <div className='absolute top-4 right-8 w-16 h-16 rounded-lg bg-pink-400/30 animate-bounce' style={{ animationDuration: '3s' }}></div>
            <div className='absolute bottom-8 right-20 w-12 h-12 rounded-lg bg-blue-400/30 animate-bounce' style={{ animationDuration: '2.5s' }}></div>
            <div className='absolute top-16 left-8 w-10 h-10 rounded-lg bg-purple-400/30 animate-bounce' style={{ animationDuration: '4s' }}></div>
            <div className='absolute bottom-12 left-12 w-14 h-14 rounded-lg bg-indigo-400/30 animate-bounce' style={{ animationDuration: '3.5s' }}></div>
            <div className='absolute top-24 right-16 w-8 h-8 rounded-lg bg-green-400/30 animate-bounce' style={{ animationDuration: '2.8s' }}></div>
          </div>
        </div>
      ),
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
        className={`w-full py-4 px-6 fixed top-0 z-40 transition-all duration-500 ${isScrolled ? 'bg-black/80 backdrop-blur-sm' : 'bg-transparent'}`}
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
          <div className='flex gap-6 items-center'>
            <button
              onClick={() => (window.location.href = '/sign-in')}
              className='text-white hover:text-gray-300 transition-colors font-inter relative group text-sm'
            >
              <span>Sign In</span>
              <span className='absolute bottom-0 left-0 w-0 h-px bg-white group-hover:w-full transition-all duration-300' />
            </button>
            <motion.button
              onClick={() => (window.location.href = '/sign-up')}
              className='relative px-5 py-1.5 rounded-full overflow-hidden'
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className='absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600'></span>
              <span className='relative z-10 text-white font-medium text-sm'>
                Join Now
              </span>
            </motion.button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section
        ref={topSectionRef}
        className='relative h-screen flex items-center justify-center overflow-hidden'
      >
        <div className='absolute inset-0 z-0'>
          <SimplifiedBackground />
        </div>

        <div className='relative z-20 text-center px-4 max-w-5xl mx-auto'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className='mb-6 flex items-center justify-center'
          >
            <h1 className='text-5xl md:text-7xl lg:text-8xl font-bold text-center text-white px-4'>
              <TypewriterEffect words={words} />
            </h1>
          </motion.div>

          <div className='mt-8 max-w-3xl mx-auto'>
            <TextGenerateEffect words='Join millions of creators sharing their moments, connecting with others, and building their digital legacy through the power of visual storytelling.' />

            <div className='mt-10 flex justify-center'>
              {/* Animated gradient button */}
              <motion.button
                onClick={() => (window.location.href = '/sign-up')}
                className='relative inline-flex h-14 overflow-hidden rounded-full p-[1px] focus:outline-none'
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className='absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]' />
                <span className='inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-8 py-4 text-base font-medium text-white backdrop-blur-3xl'>
                  Get Started
                </span>
              </motion.button>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className='relative py-20 overflow-hidden bg-black'>
        <div className='max-w-7xl mx-auto px-6 text-center'>
          <TextReveal className='text-3xl md:text-4xl font-bold mb-4 px-4'>
            Built With Modern Technologies
          </TextReveal>
          <p className='text-gray-400 max-w-2xl mx-auto mb-16 px-4 text-xs sm:text-sm'>
            Horizon leverages the latest web technologies to provide a seamless,
            fast, and engaging social media experience
          </p>

          <div className='h-64 md:h-80 relative mb-8'>
            <IconCloud
              images={[
                // Frontend core
                'https://cdn.simpleicons.org/react/61DAFB',
                'https://cdn.simpleicons.org/typescript/3178C6',
                'https://cdn.simpleicons.org/tailwindcss/06B6D4',
                'https://cdn.simpleicons.org/vite/646CFF',

                // UI/Animation
                'https://cdn.simpleicons.org/framermotion/0055FF',
                'https://cdn.simpleicons.org/reactrouter/CA4245',

                // Backend
                'https://cdn.simpleicons.org/appwrite/FD366E',
                'https://cdn.simpleicons.org/socket.io/ffffff',

                // State management
                'https://cdn.simpleicons.org/reactquery/FF4154',

                // Form handling
                'https://cdn.simpleicons.org/zod/3E67B1',
                'https://cdn.simpleicons.org/reacthookform/EC5990',

                // Tools & ecosystem
                'https://cdn.simpleicons.org/git/F05032',
                'https://cdn.simpleicons.org/github/181717',
                'https://cdn.simpleicons.org/jest/C21325',

                // Deployment
                'https://cdn.simpleicons.org/vercel/ffffff',
              ]}
              iconSize={32}
              canvasWidth={400}
              canvasHeight={350}
            />
          </div>
        </div>
      </section>

      {/* Feature Showcase with BentoGrid */}
      <section className='w-full px-6 py-20 bg-black relative'>
        <div className='max-w-[1400px] mx-auto'>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-100px' }}
            className='text-center mb-16'
          >
            <h2 className='text-3xl md:text-4xl font-bold mb-4 px-4'>
              Discover What Horizon Offers
            </h2>
            <p className='text-gray-400 max-w-2xl mx-auto px-4 text-xs sm:text-sm'>
              A modern social platform with all the features you need to
              connect, share, and grow your online presence
            </p>
          </motion.div>

          <div className='mb-16 px-2 sm:px-0'>
            <BentoGrid>
              {features.map((feature, idx) => (
                <BentoCard key={idx} {...feature} />
              ))}
            </BentoGrid>
          </div>

          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-100px' }}
            className='text-3xl font-bold text-center my-16 font-inter tracking-tight px-4'
          >
            Elevate Your Social Experience
          </motion.h2>

          <div className='mb-16 px-2 sm:px-0'>
            <BentoGrid>
              {advancedFeatures.map((feature, idx) => (
                <BentoCard key={idx} {...feature} />
              ))}
            </BentoGrid>
          </div>
        </div>
      </section>

      {/* Hero Parallax Section */}
      {parallaxProducts.length > 0 && (
        <HeroParallax products={parallaxProducts} />
      )}

      {/* Testimonials - Infinite Moving Cards */}
      <div className='relative flex flex-col items-center justify-center bg-black overflow-hidden py-14 mb-0'>
        <h2 className='text-2xl md:text-3xl font-bold text-center text-white mb-8 px-4'>
          What Our Users Say
        </h2>
        <div className='relative w-full max-w-[1400px] mx-auto'>
          <InfiniteMovingCards
            items={testimonials}
            direction='right'
            speed='slow'
          />
        </div>
      </div>

      {/* Features Grid */}
      <section
        ref={aboutSectionRef}
        className='w-full px-6 pt-4 pb-14 bg-black relative overflow-hidden'
      >
        <div className='max-w-7xl mx-auto'>
          <motion.div style={{ opacity, y }} className='text-center mb-16'>
            <TextReveal className='text-3xl md:text-4xl font-bold mb-6 px-4'>
              Experience the Difference
            </TextReveal>
            <p className='text-gray-400 max-w-2xl mx-auto px-4 text-xs sm:text-sm'>
              More than just a social network - a complete platform for
              creators, influencers, and everyone with a story to tell
            </p>
          </motion.div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12 px-4 sm:px-0'>
            <FeatureCard
              title='Real-time Messaging'
              description='Connect instantly with friends and followers through our lightning-fast messaging system'
              icon={<MessageCircle className='w-6 h-6' />}
              index={0}
            />
            <FeatureCard
              title='Global Reach'
              description='Connect with creators from around the world and expand your network'
              icon={<Globe className='w-6 h-6' />}
              index={1}
            />
            <FeatureCard
              title='Advanced Search'
              description="Find exactly what you're looking for with our powerful search algorithm"
              icon={<Search className='w-6 h-6' />}
              index={2}
            />
          </div>
        </div>
      </section>

      {/* Express Yourself Section with Morphing Text */}
      <section className='w-full px-6 py-20 relative z-10 bg-black'>
        <div className='max-w-[1400px] mx-auto'>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-100px' }}
            className='text-center mb-16'
          >
            {/* Smaller MorphingText component */}
            <MorphingText
              texts={expressYourselfPhrases}
              className='mb-4 font-inter tracking-tight'
              fontSize='text-4xl'
              mobileSize='text-2xl'
              tabletSize='text-3xl'
            />
            <p className='text-gray-400 max-w-2xl mx-auto px-4 text-xs sm:text-sm'>
              Horizon gives you the tools to share your authentic self with the
              world
            </p>
          </motion.div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-12 px-2 sm:px-0'>
            {[
              {
                title: 'Connect',
                description:
                  'Build meaningful connections with creators worldwide',
                icon: <MessageCircle className='w-6 h-6' />,
              },
              {
                title: 'Grow',
                description:
                  'Develop your personal brand and reach new audiences',
                icon: <Award className='w-6 h-6' />,
              },

              {
                title: ' Share Stories',
                description:
                  'Share your daily moments through photos and stories',
                icon: <Camera className='w-6 h-6' />,
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                viewport={{ once: true }}
                className='text-center p-8 rounded-2xl border border-white/10 bg-white/[0.02] transition-all duration-500 hover:bg-white/[0.05] hover:border-violet-500/30'
              >
                <div className='relative mx-auto mb-4 w-14 h-14 flex items-center justify-center rounded-full bg-gradient-to-br from-violet-600/20 to-indigo-600/20 text-violet-500 group-hover:text-white transition-all duration-300'>
                  {feature.icon}
                </div>
                <h3 className='text-xl font-bold mb-4 font-inter'>
                  {feature.title}
                </h3>
                <p className='text-gray-400 font-inter leading-relaxed text-sm'>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className='w-full px-6 py-16 bg-black relative overflow-hidden'>
        <div className='max-w-[800px] mx-auto text-center relative z-10 px-4'>
          <h2 className='text-2xl sm:text-3xl md:text-4xl font-bold mb-4 px-4 text-violet-500'>
            Ready to Join Horizon?
          </h2>
          <p className='text-sm sm:text-base text-gray-300 mb-8 max-w-xl mx-auto px-4'>
            Start sharing your story with the world today and connect with
            like-minded creators.
          </p>

          <motion.button
            onClick={() => (window.location.href = '/sign-up')}
            className='relative px-6 py-2.5 rounded-full overflow-hidden'
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className='absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600'></span>
            <span className='relative z-10 text-white font-medium text-sm'>
              Create Your Account
            </span>
          </motion.button>

          <p className='text-gray-400 mt-6 px-4 text-xs'>
            Join thousands of creators already on the platform
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className='w-full px-6 py-12 relative z-10 bg-black border-t border-white/10'>
        <div className='max-w-[1400px] mx-auto'>
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 mb-10'>
            <div>
              <h3 className='text-lg font-bold mb-4'>Horizon</h3>
              <p className='text-gray-400 text-sm'>
                A modern social platform for creators and storytellers
              </p>
            </div>
            <div>
              <h4 className='text-md font-semibold mb-4'>Features</h4>
              <ul className='space-y-2 text-gray-400 text-sm'>
                <li>Photo Sharing</li>
                <li>Stories</li>
                <li>Messaging</li>
                <li>Explore</li>
              </ul>
            </div>
            <div>
              <h4 className='text-md font-semibold mb-4'>Company</h4>
              <ul className='space-y-2 text-gray-400 text-sm'>
                <li>About Us</li>
                <li>Careers</li>
                <li>Press</li>
                <li>Contact</li>
              </ul>
            </div>
            <div>
              <h4 className='text-md font-semibold mb-4'>Legal</h4>
              <ul className='space-y-2 text-gray-400 text-sm'>
                <li>Terms of Service</li>
                <li>Privacy Policy</li>
                <li>Cookie Policy</li>
                <li>Community Guidelines</li>
              </ul>
            </div>
          </div>

          <div className='pt-8 border-t border-white/10 flex justify-center text-center'>
            <p className='text-gray-400 font-inter text-xs sm:text-sm'>
              © {new Date().getFullYear()} Horizon. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;