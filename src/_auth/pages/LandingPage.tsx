import React, { useRef } from 'react';
import { useGetRecentPosts } from '@/lib/react-query/queries';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { useScrollEffect } from '@/hooks/useScrollEffect';

import { LandingHeader } from '@/_auth/pages/landing/landing-header';
import { LandingHero } from '@/_auth/pages/landing/landing-hero';
import { LandingTechStack } from '@/_auth/pages/landing/landing-tech-stack';
import { LandingAppMockup } from '@/_auth/pages/landing/landing-app-mockup';
import { LandingFeatureCarousel } from '@/_auth/pages/landing/landing-feature-carousel';
import { LandingBentoGrid } from '@/_auth/pages/landing/landing-bento-grid';
import { LandingGlassCards } from '@/_auth/pages/landing/landing-glass-cards';
import { LandingParallax } from '@/_auth/pages/landing/landing-parallax';
import { LandingTestimonials } from '@/_auth/pages/landing/landing-testimonials';
import { LandingCTA } from '@/_auth/pages/landing/landing-cta';
import { LandingFooter } from '@/_auth/pages/landing/landing-footer';

const LandingPage: React.FC = () => {
  const { data: posts } = useGetRecentPosts();
  const { isScrolled } = useScrollEffect();
  const headerRef = useRef<HTMLDivElement>(null);
  const topSectionRef = useRef<HTMLElement>(null);

  const { hasIntersected, setupIntersectionObserver } =
    useIntersectionObserver();

  const parallaxProducts = React.useMemo(() => {
    return (
      posts?.documents?.map((post: any) => ({
        title: post.caption || (post.creator?.name ?? 'Horizon Post'),
        thumbnail: post.imageUrl,
      })) || []
    );
  }, [posts]);

  return (
    <div className='w-full min-h-screen bg-black text-white font-inter overflow-x-hidden'>
      <LandingHeader
        isScrolled={isScrolled}
        headerRef={headerRef}
        topSectionRef={topSectionRef}
      />

      <LandingHero topSectionRef={topSectionRef} />

      <LandingTechStack
        hasIntersected={hasIntersected['tech-stack']}
        setupRef={setupIntersectionObserver('tech-stack')}
      />

      <LandingAppMockup
        hasIntersected={hasIntersected['app-mockup']}
        setupRef={setupIntersectionObserver('app-mockup')}
      />

      <LandingFeatureCarousel
        hasIntersected={hasIntersected['feature-carousel']}
        setupRef={setupIntersectionObserver('feature-carousel')}
      />

      <LandingBentoGrid
        hasIntersected={hasIntersected['feature-grid']}
        setupRef={setupIntersectionObserver('feature-grid')}
      />

      <LandingGlassCards
        hasIntersected={hasIntersected['glass-cards']}
        setupRef={setupIntersectionObserver('glass-cards')}
      />

      <LandingParallax
        products={parallaxProducts}
        hasIntersected={hasIntersected['parallax']}
        setupRef={setupIntersectionObserver('parallax')}
      />

      <LandingTestimonials
        hasIntersected={hasIntersected['testimonials']}
        setupRef={setupIntersectionObserver('testimonials')}
      />

      <LandingCTA />

      <LandingFooter />
    </div>
  );
};

export default LandingPage;
