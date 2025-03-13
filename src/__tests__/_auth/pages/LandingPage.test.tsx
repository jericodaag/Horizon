import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import LandingPage from '@/_auth/pages/LandingPage';

// Mock IntersectionObserver which is not available in the test environment
class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: readonly number[] = [];

  constructor(callback: IntersectionObserverCallback) {
    // Immediately call the callback with empty entries to simulate elements being visible
    setTimeout(() => {
      callback([], this);
    }, 0);
  }

  observe() { return; }
  unobserve() { return; }
  disconnect() { return; }
  takeRecords(): IntersectionObserverEntry[] { return []; }
}

global.IntersectionObserver = MockIntersectionObserver as any;

// Mock framer-motion to avoid animation issues
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    h2: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>
  },
  AnimatePresence: ({ children }: any) => <>{children}</>
}));

// Mock necessary dependencies
const mockPosts = {
  documents: [
    {
      $id: '1',
      caption: 'Beautiful sunset',
      imageUrl: '/assets/images/post1.jpg',
      creator: { name: 'John Doe' }
    },
    {
      $id: '2',
      caption: 'City skyline',
      imageUrl: '/assets/images/post2.jpg',
      creator: { name: 'Jane Smith' }
    },
    {
      $id: '3',
      caption: 'Mountain view',
      imageUrl: '/assets/images/post3.jpg',
      creator: { name: 'Alex Johnson' }
    }
  ]
};

// Mock API query
jest.mock('@/lib/react-query/queries', () => ({
  useGetRecentPosts: () => ({ data: mockPosts })
}));

// Mock window.location
const mockLocationAssign = jest.fn();
Object.defineProperty(window, 'location', {
  value: {
    href: '',
    assign: mockLocationAssign
  },
  writable: true
});

// Mock video element
HTMLMediaElement.prototype.play = jest.fn();
HTMLMediaElement.prototype.pause = jest.fn();

// Mock document.createElement for style elements
const originalCreateElement = document.createElement;
document.createElement = function (tagName) {
  if (tagName.toLowerCase() === 'style') {
    const element = originalCreateElement.call(document, tagName);
    // Mock appendChild to avoid actually modifying the DOM
    element.appendChild = jest.fn();
    return element;
  }

  return originalCreateElement.call(document, tagName);
};

describe('LandingPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset window.location.href
    window.location.href = '';
  });

  it('renders the landing page with header and hero section', () => {
    render(<LandingPage />);

    // Check header elements
    expect(screen.getByText('HORIZON')).toBeInTheDocument();
    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.getByText('Join Now')).toBeInTheDocument();

    // Check hero section
    expect(screen.getByText('Share Your Story')).toBeInTheDocument();
    expect(screen.getByText(/Join millions of creators/)).toBeInTheDocument();
    expect(screen.getByText('Get Started')).toBeInTheDocument();
  });

  it('renders the features section', () => {
    render(<LandingPage />);

    // Check features
    expect(screen.getByText('Express Yourself')).toBeInTheDocument();
    expect(screen.getByText('Share Stories')).toBeInTheDocument();
    expect(screen.getByText('Connect')).toBeInTheDocument();
    expect(screen.getByText('Grow')).toBeInTheDocument();
  });

  it('renders footer with current year', () => {
    render(<LandingPage />);

    const currentYear = new Date().getFullYear();
    expect(screen.getByText(`© ${currentYear} Horizon. All rights reserved.`)).toBeInTheDocument();
  });

  it('renders post grid with data from API', () => {
    render(<LandingPage />);

    // Check if posts are rendered
    mockPosts.documents.forEach(post => {
      expect(screen.getByText(post.creator.name)).toBeInTheDocument();
      expect(screen.getByText(post.caption)).toBeInTheDocument();
      expect(screen.getByAltText(post.caption)).toBeInTheDocument();
    });
  });

  it('navigates to sign-in page when Sign In button is clicked', () => {
    render(<LandingPage />);

    const signInButton = screen.getByText('Sign In');
    fireEvent.click(signInButton);

    // Check if navigation occurred
    expect(window.location.href).toBe('/sign-in');
  });

  it('navigates to sign-up page when Join Now button is clicked', () => {
    render(<LandingPage />);

    const joinNowButton = screen.getByText('Join Now');
    fireEvent.click(joinNowButton);

    // Check if navigation occurred
    expect(window.location.href).toBe('/sign-up');
  });

  it('navigates to sign-up page when Get Started button is clicked', () => {
    render(<LandingPage />);

    const getStartedButton = screen.getByText('Get Started');
    fireEvent.click(getStartedButton);

    // Check if navigation occurred
    expect(window.location.href).toBe('/sign-up');
  });
});