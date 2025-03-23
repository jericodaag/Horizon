import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { mockGetRecentPosts } from '@/__tests__/__mocks__/api';

// We need to manually mock all lazily loaded components BEFORE importing the component
jest.mock('@/components/ui/hero-parallax', () => ({
  HeroParallax: () => <div data-testid='hero-parallax'>Hero Parallax</div>,
}));

jest.mock('@/components/ui/infinite-moving-cards', () => ({
  InfiniteMovingCards: () => (
    <div data-testid='infinite-moving-cards'>Moving Cards</div>
  ),
}));

jest.mock('@/components/ui/bento-grid', () => ({
  BentoGrid: ({ children }) => <div data-testid='bento-grid'>{children}</div>,
  BentoCard: ({ name, description }) => (
    <div data-testid={`bento-card-${name}`}>
      <h3>{name}</h3>
      <p>{description}</p>
    </div>
  ),
}));

jest.mock('@/components/ui/text-reveal', () => ({
  TextReveal: ({ children }) => <div data-testid='text-reveal'>{children}</div>,
}));

jest.mock('@/components/ui/apple-card-carousel', () => ({
  AppleCardsCarousel: () => (
    <div data-testid='apple-cards-carousel'>Cards Carousel</div>
  ),
}));

// Mock other UI components
jest.mock('@/components/ui/text-generate-effect', () => ({
  TextGenerateEffect: ({ words }) => (
    <p data-testid='text-generate-effect'>{words}</p>
  ),
}));

jest.mock('@/components/ui/simplified-background', () => ({
  SimplifiedBackground: () => <div data-testid='simplified-background' />,
}));

jest.mock('@/components/ui/typewriter', () => ({
  TypewriterEffect: () => (
    <div data-testid='typewriter-effect'>Share Your Story</div>
  ),
}));

jest.mock('@/components/ui/morphing-text', () => ({
  __esModule: true,
  default: () => <div data-testid='morphing-text'>Express Yourself</div>,
}));

jest.mock('@/components/ui/loading-fallback', () => ({
  __esModule: true,
  default: () => <div data-testid='loading-fallback'>Loading...</div>,
}));

jest.mock('@/components/ui/glass-card', () => ({
  __esModule: true,
  default: ({ title }) => (
    <div data-testid={`glass-card-${title}`}>{title}</div>
  ),
}));

jest.mock('@/components/ui/tech-stack-orbit', () => ({
  TechStackOrbit: () => <div data-testid='tech-stack-orbit'>Tech Stack</div>,
}));

// Mock the intersection observer hook
jest.mock('@/hooks/useIntersectionObserver', () => ({
  useIntersectionObserver: () => ({
    hasIntersected: {
      'tech-stack': true,
      'feature-carousel': true,
      'feature-grid': true,
      'glass-cards': true,
      parallax: true,
      testimonials: true,
    },
    setupIntersectionObserver: () => jest.fn(),
  }),
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    button: ({ children, onClick, ...props }) => (
      <button onClick={onClick} {...props}>
        {children}
      </button>
    ),
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  MessageCircle: () => <div data-testid='icon-message'>Message Icon</div>,
  Camera: () => <div data-testid='icon-camera'>Camera Icon</div>,
  Compass: () => <div data-testid='icon-compass'>Compass Icon</div>,
  Heart: () => <div data-testid='icon-heart'>Heart Icon</div>,
  Bookmark: () => <div data-testid='icon-bookmark'>Bookmark Icon</div>,
  Award: () => <div data-testid='icon-award'>Award Icon</div>,
  Globe: () => <div data-testid='icon-globe'>Globe Icon</div>,
}));

// Import the component AFTER all mocks are set up
import LandingPage from '@/_auth/pages/LandingPage';

describe('LandingPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock window.location
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { href: '' },
    });

    // Mock posts data
    mockGetRecentPosts.mockReturnValue({
      data: {
        documents: [
          {
            caption: 'Test Caption',
            imageUrl: '/test-image.jpg',
            creator: { name: 'Test User' },
          },
        ],
      },
    });
  });

  it('renders the header and hero section', () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    // Check header elements
    expect(screen.getByText('HORIZON')).toBeInTheDocument();
    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.getByText('Join Now')).toBeInTheDocument();

    // Check hero section elements
    expect(screen.getByTestId('typewriter-effect')).toBeInTheDocument();
    expect(screen.getByTestId('text-generate-effect')).toBeInTheDocument();
    expect(screen.getByText('Get Started')).toBeInTheDocument();
  });

  it('navigates to sign-in page when Sign In button is clicked', () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText('Sign In'));
    expect(window.location.href).toBe('/sign-in');
  });

  it('navigates to sign-up page when Join Now button is clicked', () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText('Join Now'));
    expect(window.location.href).toBe('/sign-up');
  });

  it('renders feature sections with correct content', () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    // Check for feature sections
    expect(
      screen.getByText('Discover What Horizon Offers')
    ).toBeInTheDocument();
    expect(screen.getByTestId('bento-grid')).toBeInTheDocument();
  });

  it('renders call-to-action section with sign-up button', () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    expect(screen.getByText('Ready to Join Horizon?')).toBeInTheDocument();

    const signUpButton = screen.getByText('Create Your Account');
    expect(signUpButton).toBeInTheDocument();

    fireEvent.click(signUpButton);
    expect(window.location.href).toBe('/sign-up');
  });

  it('renders footer with copyright information', () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    const currentYear = new Date().getFullYear();
    expect(
      screen.getByText(`© ${currentYear} Horizon. All rights reserved.`)
    ).toBeInTheDocument();
  });
});
