import React, { useEffect, useState, useRef, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useGetRecentPosts } from '@/lib/react-query/queries';

// Import regular components
import { TextGenerateEffect } from '@/components/ui/text-generate-effect';
import { SimplifiedBackground } from '@/components/ui/simplified-background';
import { TypewriterEffect } from '@/components/ui/typewriter';
import MorphingText from '@/components/ui/morphing-text';
import LoadingFallback from '@/components/ui/loading-fallback';
import GlassCard from '@/components/ui/glass-card';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

// Icons
import {
  MessageCircle,
  Camera,
  Compass,
  Heart,
  Bookmark,
  Award,
  Globe,
} from 'lucide-react';
import { TechStackOrbit } from '@/components/ui/tech-stack-orbit';

// Lazy load heavy components
const HeroParallax = lazy(() => import('@/components/ui/hero-parallax').then(module => ({ default: module.HeroParallax })));
const InfiniteMovingCards = lazy(() => import('@/components/ui/infinite-moving-cards').then(module => ({ default: module.InfiniteMovingCards })));
const BentoGrid = lazy(() => import('@/components/ui/bento-grid').then(module => ({ default: module.BentoGrid })));
const BentoCard = lazy(() => import('@/components/ui/bento-grid').then(module => ({ default: module.BentoCard })));
const TextReveal = lazy(() => import('@/components/ui/text-reveal').then(module => ({ default: module.TextReveal })));
const AppleCardsCarousel = lazy(() => import('@/components/ui/apple-card-carousel').then(module => ({ default: module.AppleCardsCarousel })));

// Define interfaces for remaining non-component types
interface Feature {
  Icon: React.FC<{ className?: string }> | (() => JSX.Element);
  name: string;
  description: string;
  href?: string;
  cta?: string;
  className?: string;
  background?: React.ReactNode;
}

interface Testimonial {
  quote: string;
  name: string;
  title: string;
}

interface CarouselItem {
  category: string;
  title: string;
  description: string;
  image: string;
}

interface GlassFeature {
  title: string;
  description: string;
  icon: React.ReactNode;
}

// Optimized style injection
const injectStyles = (): (() => void) => {
  // Custom scrollbar styles
  const style = document.createElement('style');
  style.textContent = `
    ::-webkit-scrollbar {
      width: 8px;
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

    /* Optimized animations */
    @keyframes fadeUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .animate-fade-up {
      animation: fadeUp 0.5s ease-out forwards;
    }

    /* Simplified 3D effect */
    .card-3d {
      transform-style: preserve-3d;
      perspective: 1000px;
    }

    .card-3d-content {
      transition: transform 0.2s ease-out;
      will-change: transform;
    }

    .card-3d:hover .card-3d-content {
      transform: translateZ(20px);
    }

    /* Improved hover effects with hardware acceleration */
    .hover-glow:hover {
      box-shadow: 0 0 15px rgba(139, 92, 246, 0.5);
      transition: box-shadow 0.3s ease;
      will-change: box-shadow;
    }
  `;
  document.head.appendChild(style);
  return () => {
    document.head.removeChild(style);
  };
};

// Define static data outside component to prevent recreation on each render
const words = [
  { text: 'Share ' },
  { text: 'Your ' },
  { text: 'Story ', className: 'text-violet-500' },
];

const expressYourselfPhrases = [
  'Express Yourself',
  'Be Authentic',
  'Tell Your Story',
  'Share Your Vision',
];

const testimonials: Testimonial[] = [
  {
    quote: 'Horizon has completely transformed how I share my photography with the world.',
    name: 'John Pingul',
    title: 'Professional Photographer',
  },
  {
    quote: "The connections I've made through this platform have been incredible. Best community ever!",
    name: 'Elmalia Diaz',
    title: 'Content Creator',
  },
  {
    quote: 'This platform has helped me grow my audience by 300% in just three months.',
    name: 'Richard Darwin',
    title: 'Influencer',
  },
  {
    quote: 'I love the clean interface and how easy it is to share my daily experiences.',
    name: 'Paul Santos',
    title: 'Travel Blogger',
  },
  {
    quote: "The engagement on my posts here is way higher than on any other platform I've used.",
    name: 'Ranielle Tuazon',
    title: 'Digital Artist',
  },
];

const carouselItems: CarouselItem[] = [
  {
    category: "Social",
    title: 'Connect With Friends',
    description: 'Build meaningful relationships with creators worldwide',
    image: '/assets/images/image1.jpg',
  },
  {
    category: "Create",
    title: 'Share Your Story',
    description: 'Express yourself through photos, videos, and stories',
    image: '/assets/images/image2.jpg',
  },
  {
    category: "Explore",
    title: 'Discover Content',
    description: 'Find new creators aligned with your interests',
    image: '/assets/images/image3.jpg',
  },
  {
    category: "Growth",
    title: 'Grow Your Community',
    description: 'Expand your reach and build your personal brand',
    image: '/assets/images/image4.jpg',
  },
  {
    category: "Engage",
    title: 'Real-time Interactions',
    description: 'Engage with your audience through live features',
    image: '/assets/images/image6.jpg',
  },
];

const features: Feature[] = [
  {
    Icon: Camera,
    name: 'Create Posts',
    description: 'Share your photos and moments with creators around the world.',
    href: '/sign-in',
    cta: 'Try it out',
    className: 'col-span-3 lg:col-span-1',
    background: (
      <div className='absolute inset-0 overflow-hidden'>
        <div className='absolute top-10 left-6 text-sm opacity-5 text-blue-300 font-bold'>
          #photography
        </div>
        <div className='absolute bottom-12 right-8 text-sm opacity-5 text-indigo-300 font-bold'>
          #moments
        </div>
        <div className='absolute top-4 right-10 text-sm opacity-5 text-purple-300 font-bold'>
          #create
        </div>
        <div className='absolute bottom-6 left-10 text-sm opacity-5 text-sky-300 font-bold'>
          #share
        </div>
      </div>
    ),
  },
  {
    Icon: Heart,
    name: 'Engage With Content',
    description: 'Like, comment and save your favorite posts for later viewing.',
    href: '/sign-in',
    cta: 'Learn more',
    className: 'col-span-3 lg:col-span-2',
    background: (
      <div className='absolute right-5 top-10 [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)]'>
        <div className='grid grid-cols-2 gap-4'>
          {[...Array(4)].map((_, idx) => (
            <div
              key={idx}
              className='w-24 h-24 rounded-lg bg-gradient-to-br from-purple-500/10 to-blue-500/10 flex items-center justify-center'
            >
              <Heart className='w-8 h-8 text-white/20' />
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
            className='w-16 h-16 rounded-md bg-gradient-to-br from-indigo-500/10 to-purple-500/10'
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
      <div className='absolute right-5 top-10 opacity-20'>
        <div className='flex flex-col gap-2'>
          <div className='w-32 h-6 rounded-full bg-violet-500/20 self-end'></div>
          <div className='w-24 h-6 rounded-full bg-indigo-500/20 self-start'></div>
          <div className='w-36 h-6 rounded-full bg-violet-500/20 self-end'></div>
          <div className='w-28 h-6 rounded-full bg-indigo-500/20 self-start'></div>
        </div>
      </div>
    ),
  },
];

const glassFeatures: GlassFeature[] = [
  {
    title: 'Real-time Messaging',
    description: 'Connect instantly with your followers through secure, instant messaging',
    icon: <MessageCircle className="h-5 w-5 text-violet-400" />,
  },
  {
    title: 'Post Creation',
    description: 'Create and share posts with tags for better discovery by other users',
    icon: <Camera className="h-5 w-5 text-indigo-400" />,
  },
  {
    title: 'Multilingual Support',
    description: 'Reach global audiences with automatic translation of posts and comments',
    icon: <Globe className="h-5 w-5 text-blue-400" />,
  },
  {
    title: 'Custom Collections',
    description: 'Organize saved content into personalized collections',
    icon: <Bookmark className="h-5 w-5 text-pink-400" />,
  },
];

const LandingPage: React.FC = () => {
  const { data: posts } = useGetRecentPosts();
  const [isScrolled, setIsScrolled] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const topSectionRef = useRef<HTMLElement>(null);

  // Use the custom intersection observer hook
  const { hasIntersected, setupIntersectionObserver } = useIntersectionObserver();

  // Optimize scroll event listener with debounce
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const handleScroll = () => {
      if (timeoutId) {
        return;
      }

      timeoutId = setTimeout(() => {
        if (window.scrollY > 50) {
          setIsScrolled(true);
        } else {
          setIsScrolled(false);
        }
        timeoutId = null as unknown as ReturnType<typeof setTimeout>;
      }, 100); // Debounce by 100ms
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  // Inject styles only once
  useEffect(() => {
    return injectStyles();
  }, []);

  // Transform posts into products format, memoize to prevent recalculation
  const parallaxProducts = React.useMemo(() => {
    return posts?.documents?.map((post: any) => ({
      title: post.caption || (post.creator?.name ?? 'Horizon Post'),
      thumbnail: post.imageUrl,
    })) || [];
  }, [posts]);

  return (
    <div className='w-full min-h-screen bg-black text-white font-inter overflow-x-hidden'>
      {/* Header - Optimized with simplified structure */}
      <header
        ref={headerRef}
        className={`w-full py-4 px-6 fixed top-0 z-40 transition-all duration-300 ${isScrolled ? 'bg-black/80 backdrop-blur-sm' : 'bg-transparent'}`}
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

      {/* Hero Section - Simplified with fewer animations */}
      <section
        ref={topSectionRef}
        className='relative h-screen flex items-center justify-center overflow-hidden'
      >
        <div className='absolute inset-0 z-0 position-relative'>
          <SimplifiedBackground />
        </div>

        <div className='relative z-20 text-center px-4 max-w-5xl mx-auto'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className='mb-4 sm:mb-6 flex items-center justify-center'
          >
            <h1 className='text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold text-center text-white px-2 sm:px-4'>
              <TypewriterEffect words={words} />
            </h1>
          </motion.div>

          <div className='mt-6 sm:mt-8 max-w-3xl mx-auto'>
            <TextGenerateEffect words='Join millions of creators sharing their moments, connecting with others, and building their digital legacy through the power of visual storytelling.' />

            <div className='mt-8 sm:mt-10 flex justify-center'>
              {/* Simplified gradient button */}
              <motion.button
                onClick={() => (window.location.href = '/sign-up')}
                className='relative inline-flex h-12 sm:h-14 overflow-hidden rounded-full p-[1px] focus:outline-none'
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className='absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]' />
                <span className='inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-medium text-white backdrop-blur-3xl'>
                  Get Started
                </span>
              </motion.button>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section
        className='relative py-16 sm:py-20 overflow-hidden bg-black'
        ref={setupIntersectionObserver('tech-stack')}
      >
        {hasIntersected['tech-stack'] && (
          <div className='max-w-7xl mx-auto px-4 sm:px-6 text-center'>
            <Suspense fallback={<LoadingFallback />}>
              <TextReveal className='text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 px-2 sm:px-4'>
                Built With Modern Technologies
              </TextReveal>
            </Suspense>
            <p className='text-gray-400 max-w-2xl mx-auto mb-8 sm:mb-10 px-2 sm:px-4 text-xs sm:text-sm'>
              Horizon leverages the latest web technologies to provide a seamless,
              fast, and engaging social media experience
            </p>

            <div className='h-[360px] sm:h-[400px] md:h-[460px] relative mb-8 sm:mb-12'>
              <Suspense fallback={<LoadingFallback />}>
                {hasIntersected['tech-stack'] && (
                  <TechStackOrbit />
                )}
              </Suspense>
            </div>
          </div>
        )}
      </section>

      {/* Feature Cards Carousel Section */}
      <section
        className="w-full py-12 sm:py-16 bg-black relative overflow-hidden"
        ref={setupIntersectionObserver('feature-carousel')}
      >
        <div className="max-w-6xl mx-auto mb-6 sm:mb-8 px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-3 sm:gap-4 mb-6 sm:mb-10">
            <div>
              <h4 className="text-violet-400 text-sm sm:text-base font-medium mb-1 sm:mb-2">EXPERIENCE</h4>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">
                <span className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">Explore Horizon features</span>
              </h2>
            </div>
            <p className="text-gray-400 max-w-md text-xs sm:text-sm mt-2 md:mt-0">
              Discover how Horizon empowers creators and communities
            </p>
          </div>

          {hasIntersected['feature-carousel'] && (
            <Suspense fallback={<LoadingFallback />}>
              <AppleCardsCarousel items={carouselItems} />
            </Suspense>
          )}
        </div>
      </section>

      {/* Feature Showcase with BentoGrid - Lazy Loaded */}
      <section
        className='w-full px-6 py-20 bg-black relative'
        ref={setupIntersectionObserver('feature-grid')}
      >
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

          {hasIntersected['feature-grid'] && (
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

      {/* Glass Cards Section */}
      <section
        className="w-full bg-black relative overflow-hidden pb-24 sm:pb-36 md:pb-48"
        ref={setupIntersectionObserver('glass-cards')}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-16">
            <h4 className="text-violet-400 text-sm sm:text-base font-medium mb-1 sm:mb-2">PREMIUM FEATURES</h4>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
              Advanced tools for creators
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-xs sm:text-sm">
              Take your content to the next level with our powerful creator tools
            </p>
          </div>

          {hasIntersected['glass-cards'] && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {glassFeatures.map((feature, index) => (
                <GlassCard
                  key={index}
                  title={feature.title}
                  description={feature.description}
                  icon={feature.icon}
                  index={index}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Hero Parallax Section - Only load when visible and only if posts exist */}
      <section
        ref={setupIntersectionObserver('parallax')}
        className="w-full bg-black relative"
      >
        {hasIntersected['parallax'] && parallaxProducts.length > 0 && (
          <Suspense fallback={<LoadingFallback />}>
            <HeroParallax products={parallaxProducts} />
          </Suspense>
        )}
      </section>

      {/* Testimonials - Infinite Moving Cards - Lazy loaded */}
      <div
        className='relative flex flex-col items-center justify-center bg-black overflow-hidden py-14 mb-0'
        ref={setupIntersectionObserver('testimonials')}
      >
        <h2 className='text-xl md:text-2xl font-bold text-center text-white mb-6 px-4'>
          What Our Users Say
        </h2>
        <div className='relative w-full max-w-[1200px] mx-auto'>
          {hasIntersected['testimonials'] && (
            <Suspense fallback={<LoadingFallback />}>
              <InfiniteMovingCards
                items={testimonials}
                direction='right'
                speed='slow'
              />
            </Suspense>
          )}
        </div>
      </div>

      {/* Express Yourself Section with Morphing Text */}
      <section className='w-full px-4 sm:px-6 py-16 sm:py-20 relative z-10 bg-black'>
        <div className='max-w-[1400px] mx-auto'>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-100px' }}
            className='text-center mb-10 sm:mb-16'
          >
            {/* MorphingText component with responsive props */}
            <MorphingText
              texts={expressYourselfPhrases}
              className='mb-3 sm:mb-4 font-inter tracking-tight'
              fontSize='text-4xl'
              mobileSize='text-2xl'
              tabletSize='text-3xl'
            />
            <p className='text-gray-400 max-w-2xl mx-auto px-2 sm:px-4 text-xs sm:text-sm'>
              Horizon gives you the tools to share your authentic self with the world
            </p>
          </motion.div>
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 md:gap-12 px-2 sm:px-0'>
            {[
              {
                title: 'Connect',
                description: 'Build meaningful connections with creators worldwide',
                icon: <MessageCircle className='w-5 h-5 sm:w-6 sm:h-6' />,
              },
              {
                title: 'Grow',
                description: 'Develop your personal brand and reach new audiences',
                icon: <Award className='w-5 h-5 sm:w-6 sm:h-6' />,
              },
              {
                title: 'Share Stories',
                description: 'Share your daily moments through photos and stories',
                icon: <Camera className='w-5 h-5 sm:w-6 sm:h-6' />,
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                viewport={{ once: true }}
                className='text-center p-6 sm:p-8 rounded-2xl border border-white/10 bg-white/[0.02] transition-all duration-500 hover:bg-white/[0.05] hover:border-violet-500/30'
              >
                <div className='relative mx-auto mb-3 sm:mb-4 w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-full bg-gradient-to-br from-violet-600/20 to-indigo-600/20 text-violet-500 group-hover:text-white transition-all duration-300'>
                  {feature.icon}
                </div>
                <h3 className='text-lg sm:text-xl font-bold mb-2 sm:mb-4 font-inter'>
                  {feature.title}
                </h3>
                <p className='text-gray-400 font-inter leading-relaxed text-xs sm:text-sm'>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Simplified */}
      <section className='w-full px-4 sm:px-6 py-12 sm:py-16 bg-black relative overflow-hidden'>
        <div className="absolute inset-0 bg-black" />

        <div className='max-w-[800px] mx-auto text-center relative z-10 px-2 sm:px-4'>
          <h2 className='text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 px-2 sm:px-4 text-violet-500'>
            Ready to Join Horizon?
          </h2>
          <p className='text-xs sm:text-sm md:text-base text-gray-300 mb-6 sm:mb-8 max-w-xl mx-auto px-2 sm:px-4'>
            Start sharing your story with the world today and connect with
            like-minded creators.
          </p>

          <motion.button
            onClick={() => (window.location.href = '/sign-up')}
            className='relative px-5 sm:px-6 py-2 sm:py-2.5 rounded-full overflow-hidden'
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className='absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600'></span>
            <span className='relative z-10 text-white font-medium text-xs sm:text-sm'>
              Create Your Account
            </span>
          </motion.button>

          <p className='text-gray-400 mt-4 sm:mt-6 px-2 sm:px-4 text-xs'>
            Join thousands of creators already on the platform
          </p>
        </div>
      </section>

      {/* Footer - Simplified */}
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