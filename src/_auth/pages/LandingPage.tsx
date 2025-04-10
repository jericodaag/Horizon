import React, { useEffect, useState, useRef, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useGetRecentPosts } from '@/lib/react-query/queries';

// Import regular components
import { TextGenerateEffect } from '@/components/ui/text-generate-effect';
import { SimplifiedBackground } from '@/components/ui/simplified-background';
import { TypewriterEffect } from '@/components/ui/typewriter';
import LoadingFallback from '@/components/ui/loading-fallback';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { TechStackMarquee } from '@/components/ui/tech-stack-marquee';

// Icons
import {
  MessageCircle,
  Camera,
  Compass,
  Heart,
  Bookmark,
  Globe,
  Users,
  Zap,
  Bell,
  ArrowRight,
  ArrowUpRight,
  Wifi,
  Battery,
} from 'lucide-react';

// Lazy load heavy components
const HeroParallax = lazy(() => import('@/components/ui/hero-parallax').then(module => ({ default: module.HeroParallax })));
const InfiniteMovingCards = lazy(() => import('@/components/ui/infinite-moving-cards').then(module => ({ default: module.InfiniteMovingCards })));
const BentoGrid = lazy(() => import('@/components/ui/bento-grid').then(module => ({ default: module.BentoGrid })));
const BentoCard = lazy(() => import('@/components/ui/bento-grid').then(module => ({ default: module.BentoCard })));
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
  avatar?: string;
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

interface FeatureCard {
  title: string;
  description: string;
  icon: React.ReactNode;
  delay: number;
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
    
    /* Glass effect */
    .glass-effect {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    /* Gradient borders */
    .gradient-border {
      position: relative;
      border-radius: 16px;
      overflow: hidden;
    }
    
    .gradient-border::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 16px; 
      padding: 2px;
      background: linear-gradient(
        to right, 
        #8B5CF6, 
        #6366F1,
        #EC4899
      );
      -webkit-mask: 
        linear-gradient(#fff 0 0) content-box, 
        linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
      mask-composite: exclude;
      pointer-events: none;
    }
    
    /* 3D Card Float Animation */
    @keyframes float {
      0% {
        transform: translateY(0px);
      }
      50% {
        transform: translateY(-10px);
      }
      100% {
        transform: translateY(0px);
      }
    }
    
    .float-animation {
      animation: float 6s ease-in-out infinite;
    }
    
    /* Staggered Animation Delays */
    .stagger-1 { animation-delay: 0.1s; }
    .stagger-2 { animation-delay: 0.2s; }
    .stagger-3 { animation-delay: 0.3s; }
    .stagger-4 { animation-delay: 0.4s; }
    
    /* Frosted Glass Effect */
    .frosted-glass {
      background: rgba(255, 255, 255, 0.03);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.05);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
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

const testimonials: Testimonial[] = [
  {
    quote: 'Horizon has completely transformed how I share my photography with the world.',
    name: 'John Pingul',
    title: 'Professional Photographer',
    avatar: '/assets/avatars/avatar1.png'
  },
  {
    quote: "The connections I've made through this platform have been incredible. Best community ever!",
    name: 'Elmalia Diaz',
    title: 'Content Creator',
    avatar: '/assets/avatars/avatar2.png'
  },
  {
    quote: 'This platform has helped me grow my audience by 300% in just three months.',
    name: 'Richard Darwin',
    title: 'Influencer',
    avatar: '/assets/avatars/avatar3.png'
  },
  {
    quote: 'I love the clean interface and how easy it is to share my daily experiences.',
    name: 'Paul Santos',
    title: 'Travel Blogger',
    avatar: '/assets/avatars/avatar4.png'
  },
  {
    quote: "The engagement on my posts here is way higher than on any other platform I've used.",
    name: 'Ranielle Tuazon',
    title: 'Digital Artist',
    avatar: '/assets/avatars/avatar5.png'
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

// New feature cards to replace the section you wanted to remove
const featureCards: FeatureCard[] = [
  {
    title: "Connect",
    description: "Build meaningful connections with creators worldwide",
    icon: <Users className="w-6 h-6" />,
    delay: 0.1
  },
  {
    title: "Create",
    description: "Express yourself through photos, videos and stories",
    icon: <Camera className="w-6 h-6" />,
    delay: 0.2
  },
  {
    title: "Discover",
    description: "Find content and creators aligned with your interests",
    icon: <Compass className="w-6 h-6" />,
    delay: 0.3
  },
  {
    title: "Engage",
    description: "Like, comment and share content from your favorite creators",
    icon: <Heart className="w-6 h-6" />,
    delay: 0.4
  },
  {
    title: "Grow",
    description: "Build your audience and grow your online presence",
    icon: <Zap className="w-6 h-6" />,
    delay: 0.5
  },
  {
    title: "Archive",
    description: "Save and organize content into custom collections",
    icon: <Bookmark className="w-6 h-6" />,
    delay: 0.6
  }
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
      {/* Floating Navigation - Glassmorphism inspired by Instagram */}
      <header
        ref={headerRef}
        className={`w-full py-4 px-6 fixed top-0 z-40 transition-all duration-300 ${isScrolled
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
              <a href="#features" className='text-sm text-white/80 hover:text-white transition-colors duration-200'>Features</a>
              <a href="#feature-carousel" className='text-sm text-white/80 hover:text-white transition-colors duration-200'>Explore</a>
              <a href="#feature-grid" className='text-sm text-white/80 hover:text-white transition-colors duration-200'>Discover</a>
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
              <svg width="18" height="12" viewBox="0 0 18 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1H17M1 6H17M1 11H17" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </motion.button>
          </div>
        </nav>
      </header>

      {/* Hero Section - Enhanced with Glassmorphism and more modern aesthetics */}
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
                <TypewriterEffect words={words} />
              </h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className='mt-6 sm:mt-8 max-w-3xl mx-auto'
            >
              <div className="text-lg sm:text-xl text-white/80 mb-10">
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
            className="mt-auto mb-10 flex flex-col items-center"
          >
            <p className="text-white/50 text-sm mb-4">Trusted by creators worldwide</p>
            <div className="flex items-center justify-center">
            </div>
          </motion.div>
        </div>
      </section>

      {/* Tech-stack Marquee */}
      <section
        className='relative py-10 sm:py-16 pb-0 overflow-hidden bg-black'
        ref={setupIntersectionObserver('tech-stack')}
      >
        <div className='max-w-7xl mx-auto px-4 sm:px-6 text-center'>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-8"
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
              {hasIntersected['tech-stack'] && (
                <TechStackMarquee />
              )}
            </Suspense>
          </div>
        </div>
      </section>

      {/* App Mockup Section - Instagram-inspired UI */}
      <section
        id="features"
        className="w-full py-20 sm:py-28 bg-black relative overflow-hidden"
        ref={setupIntersectionObserver('app-mockup')}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-12 sm:mb-16">
            <motion.p
              className="text-violet-400 text-sm font-medium mb-2"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              MODERN EXPERIENCE
            </motion.p>
            <motion.h2
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-white/90"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              A social platform reimagined
            </motion.h2>
            <motion.p
              className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Experience a sleek, intuitive interface designed for modern creators and social networkers
            </motion.p>
          </div>

          {hasIntersected['app-mockup'] && (
            <div className="mt-12 sm:mt-16 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12">
              {/* Mobile App Mockup */}
              <motion.div
                className="w-full max-w-[320px] relative"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.3 }}
              >
                <div className="relative w-full rounded-3xl overflow-hidden aspect-[9/19] frosted-glass shadow-2xl border border-white/10">
                  {/* Phone frame */}
                  <div className="absolute inset-0 z-10 pointer-events-none">
                    {/* Notch */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1/3 h-6 bg-black rounded-b-xl"></div>

                    {/* Status bar */}
                    <div className="absolute top-0 inset-x-0 h-8 flex items-center justify-between px-6">
                      <div className="text-xs text-white/80">12:00</div>
                      <div className="flex items-center space-x-1">
                        <div className="w-4 h-4">
                        </div>
                        <div className="w-4 h-4">
                          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* App Content */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black via-black/95 to-black/90 overflow-hidden flex flex-col">
                    {/* Status Bar */}
                    <div className="absolute top-0 inset-x-0 h-8 flex items-center justify-between px-6">
                      <div className="text-xs text-white/80">12:00</div>
                      <div className="flex items-center space-x-2">
                        {/* WiFi Icon */}
                        <Wifi className="w-4 h-4 text-white/80" />
                        {/* Battery Icon */}
                        <Battery className="w-5 h-4 text-white/80" />
                      </div>
                    </div>

                    {/* App Header */}
                    <div className="pt-10 px-4 flex-shrink-0">
                      <div className="flex justify-between items-center">
                        <div className="text-xl font-bold">HORIZON</div>
                        <div className="flex gap-4">
                          <div className="w-6 h-6">
                            <img
                              src="/assets/icons/liked.svg"
                              alt="Heart"
                              className="w-full h-full text-white/90"
                            />
                          </div>
                          <div className="w-6 h-6">
                            <img
                              src="/assets/icons/message.svg"
                              alt="Message"
                              className="w-full h-full text-white/90"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Stories - smaller size to fit all without scrolling */}
                      <div className="mt-4">
                        <div className="flex justify-between">
                          {/* Your story */}
                          <div className="flex flex-col items-center">
                            <div className="w-14 h-14 rounded-full p-[2px] bg-gradient-to-br from-violet-500 via-pink-500 to-blue-500">
                              <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                                <img
                                  src="/assets/icons/add-post.svg"
                                  alt="Add story"
                                  className="w-5 h-5 text-white"
                                />
                              </div>
                            </div>
                            <span className="text-xs mt-1 text-white/80">Your story</span>
                          </div>

                          {/* Other stories */}
                          {["bateman_", "tyler1", "wayne"].map((username, index) => (
                            <div key={index} className="flex flex-col items-center">
                              <div className="w-14 h-14 rounded-full p-[2px] bg-gradient-to-br from-violet-500 via-pink-500 to-blue-500">
                                <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-500/40 to-blue-500/40 overflow-hidden">
                                  <img
                                    src={`/assets/stories/story${index + 1}.jpg`}
                                    alt={`${username}'s story`}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              </div>
                              <span className="text-xs mt-1 text-white/80">{username}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Posts - with hidden scrollbar */}
                    <div className="flex-grow overflow-y-auto scrollbar-hide border-t border-white/10">
                      <div className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 overflow-hidden">
                            <img
                              src="/assets/avatars/avatar.jpg"
                              alt="eco_daag"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <div className="text-sm font-medium">eco_dev</div>
                            <div className="text-xs text-white/60">Tokyo, Japan</div>
                          </div>
                          <div className="ml-auto">
                            <img
                              src="/assets/icons/edit.svg"
                              alt="Edit"
                              className="w-5 h-5 text-white/80"
                            />
                          </div>
                        </div>

                        <div className="mt-2 aspect-square rounded-md bg-black/30 overflow-hidden flex items-center justify-center">
                          <img
                            src="/assets/images/post1.jpg"
                            alt="Post image"
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="mt-2">
                          <div className="flex justify-between items-center">
                            <div className="flex gap-3">
                              <img
                                src="/assets/icons/liked.svg"
                                alt="Heart"
                                className="w-5 h-5 text-rose-500"
                              />
                              <img
                                src="/assets/icons/comment.svg"
                                alt="Comment"
                                className="w-5 h-5 text-white/80"
                              />
                              <img
                                src="/assets/icons/share.svg"
                                alt="Share"
                                className="w-5 h-5 text-white/80"
                              />
                            </div>
                            <img
                              src="/assets/icons/bookmark.svg"
                              alt="Bookmark"
                              className="w-5 h-5 text-white/80"
                            />
                          </div>
                          <div className="mt-1 text-sm font-medium">1,482 likes</div>
                          <div className="mt-1 text-sm">
                            <span className="font-medium">eco_dev</span>
                            <span className="text-white/80"> Exploring the beautiful streets of Tokyo #travel #japan</span>
                          </div>
                          <div className="mt-1 text-xs text-white/60">View all 42 comments</div>
                          <div className="mt-1 text-xs text-white/50">2 HOURS AGO</div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Navigation */}
                    <div className="flex-shrink-0 h-14 border-t border-white/10 flex items-center justify-around px-2">
                      <div className="w-6 h-6">
                        <img
                          src="/assets/icons/home.svg"
                          alt="Home"
                          className="w-full h-full text-white"
                        />
                      </div>
                      <div className="w-6 h-6">
                        <img
                          src="/assets/icons/search-home.svg"
                          alt="Search"
                          className="w-full h-full text-white/70"
                        />
                      </div>
                      <div className="w-6 h-6">
                        <img
                          src="/assets/icons/gallery-add.svg"
                          alt="Add post"
                          className="w-full h-full text-white/70"
                        />
                      </div>
                      <div className="w-6 h-6">
                        <img
                          src="/assets/icons/like.svg"
                          alt="Notifications"
                          className="w-full h-full text-white/70"
                        />
                      </div>
                      <div className="w-6 h-6">
                        <img
                          src="/assets/avatars/mobile-icon.jpg"
                          alt="Profile"
                          className="w-full h-full rounded-full object-cover"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute -z-10 -bottom-8 -right-8 w-40 h-40 bg-violet-600/40 rounded-full filter blur-[80px]"></div>
                <div className="absolute -z-10 -top-8 -left-8 w-40 h-40 bg-blue-600/30 rounded-full filter blur-[80px]"></div>
              </motion.div>

              {/* Feature Highlights */}
              <motion.div
                className="max-w-lg w-full"
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.5 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {[
                    {
                      icon: <Camera className="w-6 h-6 text-violet-400" />,
                      title: "Rich Media Posts",
                      description: "Share photos, videos, and stories that disappear after 24 hours"
                    },
                    {
                      icon: <Users className="w-6 h-6 text-violet-400" />,
                      title: "Social Connections",
                      description: "Follow friends and discover new creators worldwide"
                    },
                    {
                      icon: <MessageCircle className="w-6 h-6 text-violet-400" />,
                      title: "Real-time Chat",
                      description: "Direct messaging with read receipts and typing indicators"
                    },
                    {
                      icon: <Bell className="w-6 h-6 text-violet-400" />,
                      title: "Smart Notifications",
                      description: "Stay updated on likes, comments, and new followers"
                    }
                  ].map((feature, index) => (
                    <motion.div
                      key={index}
                      className="p-5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors"
                      whileHover={{ y: -5, x: 0, transition: { duration: 0.2 } }}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.2 + (index * 0.1) }}
                    >
                      <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 mb-4">
                        {feature.icon}
                      </div>
                      <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                      <p className="text-sm text-white/70">{feature.description}</p>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-6 flex justify-center md:justify-start">
                  <motion.button
                    onClick={() => (window.location.href = '/sign-up')}
                    className="relative px-5 py-2.5 overflow-hidden rounded-full group"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600 opacity-100 group-hover:opacity-90 transition-opacity"></span>
                    <span className="relative flex items-center justify-center gap-2 text-white font-medium text-sm">
                      Try It Now
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </motion.button>
                </div>
              </motion.div>
            </div>
          )
          }
        </div >
      </section >

      {/* Feature Cards - Modern Neumorphic/Glassmorphism Style */}
      < section
        id="discover"
        className="w-full py-24 px-4 sm:px-6 bg-black relative overflow-hidden"
        ref={setupIntersectionObserver('feature-cards')}
      >
        {/* Background gradients */}
        < div className="absolute inset-0 overflow-hidden" >
          <div className="absolute top-1/4 -left-20 w-72 h-72 bg-violet-600/20 rounded-full filter blur-[100px]"></div>
          <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-violet-600/20 rounded-full filter blur-[100px]"></div>
        </div >

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <motion.p
              className="text-violet-400 text-sm font-medium mb-2"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              WHAT MAKES US DIFFERENT
            </motion.p>
            <motion.h2
              className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              Express yourself with Horizon
            </motion.h2>
            <motion.p
              className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              A complete toolkit for modern social networking and content creation
            </motion.p>
          </motion.div>

          {hasIntersected['feature-cards'] && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {featureCards.map((card, index) => (
                <motion.div
                  key={index}
                  className="relative overflow-hidden rounded-xl p-1"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 + (index * 0.1) }}
                  whileHover={{
                    y: -8,
                    transition: { duration: 0.2, ease: "easeOut" }
                  }}
                >
                  {/* Gradient border */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 rounded-xl"></div>
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-600 to-indigo-600 opacity-10 rounded-xl"></div>

                  {/* Glass card */}
                  <div className="relative p-6 rounded-lg bg-black/60 backdrop-blur-md h-full border border-white/5">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center mb-5">
                      {card.icon}
                    </div>

                    <h3 className="text-xl font-bold mb-3">{card.title}</h3>
                    <p className="text-white/70 text-sm">{card.description}</p>

                    {/* Pseudo-elements for neumorphism effects */}
                    <div className="absolute bottom-0 right-0 p-4">
                      <ArrowUpRight className="w-5 h-5 text-white/30" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section >

      {/* Feature Cards Carousel Section - Redesigned */}
      < section
        id="feature-carousel"
        className="w-full py-20 sm:py-28 bg-black relative overflow-hidden"
        ref={setupIntersectionObserver('feature-carousel')}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center sm:text-left mb-12 sm:mb-16">
            <motion.p
              className="text-violet-400 text-sm font-medium mb-2"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              EXPERIENCE
            </motion.p>
            <motion.h2
              className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-white/90"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              Explore Horizon features
            </motion.h2>
            <motion.p
              className="text-gray-400 max-w-2xl mx-auto sm:mx-0 text-sm sm:text-base"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              Discover how Horizon empowers creators and communities
            </motion.p>
          </div>

          {hasIntersected['feature-carousel'] && (
            <Suspense fallback={<LoadingFallback />}>
              <AppleCardsCarousel items={carouselItems} />
            </Suspense>
          )}
        </div>
      </section >

      {/* Feature Showcase with BentoGrid - Lazy Loaded */}
      < section
        id="feature-grid"
        className='w-full px-6 py-24 bg-black relative'
        ref={setupIntersectionObserver('feature-grid')}
      >
        <div className='max-w-[1400px] mx-auto'>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className='text-center mb-16'
          >
            <motion.p
              className="text-violet-400 text-sm font-medium mb-2"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              PLATFORM HIGHLIGHTS
            </motion.p>
            <motion.h2
              className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              Discover What Horizon Offers
            </motion.h2>
            <motion.p
              className='text-gray-400 max-w-2xl mx-auto text-sm sm:text-base'
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              A modern social platform with all the features you need to
              connect, share, and grow your online presence
            </motion.p>
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
      </section >

      {/* Glass Cards Section - Enhanced */}
      < section
        id="community"
        className="w-full bg-black relative overflow-hidden pb-24 sm:pb-36"
        ref={setupIntersectionObserver('glass-cards')}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <motion.p
              className="text-violet-400 text-sm font-medium mb-2"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              PREMIUM FEATURES
            </motion.p>
            <motion.h2
              className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-white/90"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              Advanced tools for creators
            </motion.h2>
            <motion.p
              className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              Take your content to the next level with our powerful creator tools
            </motion.p>
          </div>

          {hasIntersected['glass-cards'] && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
              {glassFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  className="frosted-glass rounded-xl overflow-hidden"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 + (index * 0.1) }}
                  whileHover={{
                    y: -5,
                    scale: 1.02,
                    boxShadow: "0 15px 30px rgba(0,0,0,0.2)",
                    transition: { duration: 0.2 }
                  }}
                >
                  <div className="p-6 h-full flex flex-col">
                    <div className="flex-none mb-4">
                      <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                        {feature.icon}
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-white/70 flex-grow">{feature.description}</p>
                    <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center">
                      <span className="text-xs text-white/50">Premium Feature</span>
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                        <ArrowRight className="w-4 h-4 text-white/70" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section >

      {/* Hero Parallax Section - Only load when visible and only if posts exist */}
      < section
        ref={setupIntersectionObserver('parallax')}
        className="w-full bg-black relative"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-16">
          <div className="text-center mb-12">
            <motion.p
              className="text-violet-400 text-sm font-medium mb-2"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              EXPLORE CONTENT
            </motion.p>
            <motion.h2
              className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              Discover trending posts
            </motion.h2>
            <motion.p
              className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              See what creators are sharing on Horizon right now
            </motion.p>
          </div>
        </div>

        {
          hasIntersected['parallax'] && parallaxProducts.length > 0 && (
            <Suspense fallback={<LoadingFallback />}>
              <HeroParallax products={parallaxProducts} />
            </Suspense>
          )
        }
      </section >

      {/* Testimonials - Infinite Moving Cards - With modern styling - Border removed */}
      <section
        className='relative flex flex-col items-center justify-center bg-black overflow-hidden py-24 mb-0'
        ref={setupIntersectionObserver('testimonials')}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center mb-12">
          <motion.p
            className="text-violet-400 text-sm font-medium mb-2"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            TESTIMONIALS
          </motion.p>
          <motion.h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            What Our Users Say
          </motion.h2>
          <motion.p
            className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            Join thousands of satisfied creators already growing on Horizon
          </motion.p>
        </div>
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
      </section>

      {/* CTA Section with centered glow effect */}
      <section className="w-full py-20 sm:py-28 bg-black relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/20 rounded-full filter blur-[120px]"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-[60%] -translate-y-[40%] w-[300px] h-[300px] bg-indigo-500/15 rounded-full filter blur-[80px]"></div>
        </div>

        <div className="absolute inset-0 bg-[url('/assets/grid-pattern.svg')] bg-repeat opacity-5"></div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="flex flex-col items-center">
            <motion.div
              className="relative mb-10 w-full max-w-sm mx-auto"
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <motion.div
                className="relative z-10 p-2"
                animate={{
                  y: [0, -8, 0],
                  rotateZ: [0, 1, 0],
                  rotateX: [0, 2, 0]
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <img
                  src="/assets/images/cta.png"
                  alt="Horizon Platform"
                  className="drop-shadow-2xl relative z-10"
                />

                <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-violet-300 rounded-full animate-ping opacity-70" style={{ animationDuration: '1.5s', animationDelay: '0.2s' }}></div>
                <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-indigo-300 rounded-full animate-ping opacity-70" style={{ animationDuration: '2s', animationDelay: '0.5s' }}></div>
                <div className="absolute bottom-1/3 left-1/3 w-1.5 h-1.5 bg-fuchsia-300 rounded-full animate-ping opacity-70" style={{ animationDuration: '3s', animationDelay: '0.3s' }}></div>
                <div className="absolute top-2/3 right-1/4 w-1 h-1 bg-purple-300 rounded-full animate-ping opacity-70" style={{ animationDuration: '2.5s', animationDelay: '0.7s' }}></div>
                <div className="absolute bottom-1/4 right-1/3 w-2 h-2 bg-violet-300 rounded-full animate-ping opacity-70" style={{ animationDuration: '2.8s', animationDelay: '1s' }}></div>

                <motion.div
                  className="absolute -top-4 -right-2 w-3 h-3 bg-white rounded-full"
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0.8, 1.2, 0.8]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5
                  }}
                />
                <motion.div
                  className="absolute top-1/2 -left-3 w-2 h-2 bg-white rounded-full"
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0.8, 1.2, 0.8]
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1.2
                  }}
                />

                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-12 bg-gradient-to-t from-violet-500/20 to-transparent blur-md rounded-full"></div>
              </motion.div>
            </motion.div>

            <motion.div
              className="text-center max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h2 className="text-3xl sm:text-5xl font-bold mb-4 tracking-tight leading-tight">
                Step into the
                <motion.span
                  className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-300 to-indigo-500 ml-2"
                  animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  style={{
                    backgroundSize: '200% 200%'
                  }}
                >
                  future of social
                </motion.span>
              </h2>

              <p className="text-base text-white/70 mb-6 max-w-xl mx-auto leading-relaxed">
                Join thousands of creators and teams using Horizon to turn ideas
                into high-performing social platforms, faster than ever before.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
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

      {/* Footer - Modern - Border removed */}
      <footer className='w-full px-6 py-12 relative z-10 bg-black'>
        <div className='max-w-[1400px] mx-auto'>
          <div className="flex flex-col md:flex-row justify-between items-center md:items-start mb-10">
            <div className="text-center md:text-left mb-8 md:mb-0">
              <h3 className='text-2xl font-bold mb-2'>HORIZON</h3>
              <p className='text-gray-400 text-sm max-w-xs'>
                A modern social platform for creators and storytellers
              </p>
              <div className="flex gap-4 mt-4 justify-center md:justify-start">
                <a href="https://www.facebook.com/DaagEco" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                  <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 2H15C13.6739 2 12.4021 2.52678 11.4645 3.46447C10.5268 4.40215 10 5.67392 10 7V10H7V14H10V22H14V14H17L18 10H14V7C14 6.73478 14.1054 6.48043 14.2929 6.29289C14.4804 6.10536 14.7348 6 15 6H18V2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
                <a href="https://www.instagram.com/ecodaag" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                  <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="2" />
                    <path d="M17.5 6.5L17.51 6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </a>
                <a href="https://www.linkedin.com/in/jerico-daag" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                  <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 8C17.5913 8 19.1174 8.63214 20.2426 9.75736C21.3679 10.8826 22 12.4087 22 14V21H18V14C18 13.4696 17.7893 12.9609 17.4142 12.5858C17.0391 12.2107 16.5304 12 16 12C15.4696 12 14.9609 12.2107 14.5858 12.5858C14.2107 12.9609 14 13.4696 14 14V21H10V14C10 12.4087 10.6321 10.8826 11.7574 9.75736C12.8826 8.63214 14.4087 8 16 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M6 9H2V21H6V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M4 6C5.10457 6 6 5.10457 6 4C6 2.89543 5.10457 2 4 2C2.89543 2 2 2.89543 2 4C2 5.10457 2.89543 6 4 6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16">
              <div>
                <h4 className='text-sm font-semibold mb-4 text-white'>Features</h4>
                <ul className='space-y-2 text-gray-400 text-xs'>
                  <li className="hover:text-white transition-colors"><a href="#">Photo Sharing</a></li>
                  <li className="hover:text-white transition-colors"><a href="#">Stories</a></li>
                  <li className="hover:text-white transition-colors"><a href="#">Messaging</a></li>
                  <li className="hover:text-white transition-colors"><a href="#">Explore</a></li>
                </ul>
              </div>
              <div>
                <h4 className='text-sm font-semibold mb-4 text-white'>Company</h4>
                <ul className='space-y-2 text-gray-400 text-xs'>
                  <li className="hover:text-white transition-colors"><a href="#">About Us</a></li>
                  <li className="hover:text-white transition-colors"><a href="#">Careers</a></li>
                  <li className="hover:text-white transition-colors"><a href="#">Press</a></li>
                  <li className="hover:text-white transition-colors"><a href="#">Contact</a></li>
                </ul>
              </div>
              <div>
                <h4 className='text-sm font-semibold mb-4 text-white'>Legal</h4>
                <ul className='space-y-2 text-gray-400 text-xs'>
                  <li className="hover:text-white transition-colors"><a href="#">Terms of Service</a></li>
                  <li className="hover:text-white transition-colors"><a href="#">Privacy Policy</a></li>
                  <li className="hover:text-white transition-colors"><a href="#">Cookie Policy</a></li>
                  <li className="hover:text-white transition-colors"><a href="#">Guidelines</a></li>
                </ul>
              </div>
              <div>
                <h4 className='text-sm font-semibold mb-4 text-white'>Support</h4>
                <ul className='space-y-2 text-gray-400 text-xs'>
                  <li className="hover:text-white transition-colors"><a href="#">Help Center</a></li>
                  <li className="hover:text-white transition-colors"><a href="#">Safety Center</a></li>
                  <li className="hover:text-white transition-colors"><a href="#">Community</a></li>
                  <li className="hover:text-white transition-colors"><a href="#">Creators</a></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between">
            <p className='text-gray-400 font-inter text-xs mb-4 md:mb-0'>
              © {new Date().getFullYear()} Horizon. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-xs text-gray-400 hover:text-white transition-colors">Terms</a>
              <a href="#" className="text-xs text-gray-400 hover:text-white transition-colors">Privacy</a>
              <a href="#" className="text-xs text-gray-400 hover:text-white transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div >
  );
};

export default LandingPage;