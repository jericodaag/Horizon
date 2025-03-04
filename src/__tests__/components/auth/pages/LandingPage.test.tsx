import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import LandingPage from '@/_auth/pages/LandingPage';

// Mock the dependencies
jest.mock('@/lib/react-query/queries', () => ({
  useGetRecentPosts: () => ({
    data: {
      documents: [
        {
          $id: '1',
          caption: 'Beautiful sunset',
          imageUrl: '/image1.jpg',
          creator: { name: 'John Doe' },
        },
        {
          $id: '2',
          caption: 'City skyline',
          imageUrl: '/image2.jpg',
          creator: { name: 'Jane Smith' },
        },
      ],
    },
  }),
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    h2: ({ children, ...props }) => <h2 {...props}>{children}</h2>,
    p: ({ children, ...props }) => <p {...props}>{children}</p>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

// Mock window.location
Object.defineProperty(window, 'location', {
  writable: true,
  value: { href: '' },
});

describe('LandingPage', () => {
  beforeEach(() => {
    // Reset window.location.href before each test
    window.location.href = '';
  });

  it('renders the landing page with heading and call-to-action', () => {
    render(<LandingPage />);

    expect(screen.getByText('HORIZON')).toBeInTheDocument();
    expect(screen.getByText('Share Your Story')).toBeInTheDocument();
    expect(screen.getByText(/Join millions of creators/)).toBeInTheDocument();

    // Check for call-to-action buttons
    expect(screen.getByText('Get Started')).toBeInTheDocument();
    expect(screen.getByText('Join Now')).toBeInTheDocument();
    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });

  it('displays the current year in footer copyright', () => {
    render(<LandingPage />);

    const currentYear = new Date().getFullYear();
    expect(
      screen.getByText(`© ${currentYear} Horizon. All rights reserved.`)
    ).toBeInTheDocument();
  });

  it('navigates to sign-in page when Sign In button is clicked', () => {
    render(<LandingPage />);

    fireEvent.click(screen.getByText('Sign In'));
    expect(window.location.href).toBe('/sign-in');
  });

  it('navigates to sign-up page when Join Now button is clicked', () => {
    render(<LandingPage />);

    fireEvent.click(screen.getByText('Join Now'));
    expect(window.location.href).toBe('/sign-up');
  });

  it('navigates to sign-up page when Get Started button is clicked', () => {
    render(<LandingPage />);

    fireEvent.click(screen.getByText('Get Started'));
    expect(window.location.href).toBe('/sign-up');
  });

  it('renders the feature sections', () => {
    render(<LandingPage />);

    expect(screen.getByText('Share Stories')).toBeInTheDocument();
    expect(screen.getByText('Connect')).toBeInTheDocument();
    expect(screen.getByText('Grow')).toBeInTheDocument();

    // Check if the feature descriptions are present
    expect(
      screen.getByText('Share your daily moments through photos and stories')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Build meaningful connections with creators worldwide')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Develop your personal brand and reach new audiences')
    ).toBeInTheDocument();
  });

  it('renders post grid with post data', () => {
    render(<LandingPage />);

    // Check if post creator names are displayed
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();

    // Check if post captions are displayed
    expect(screen.getByText('Beautiful sunset')).toBeInTheDocument();
    expect(screen.getByText('City skyline')).toBeInTheDocument();
  });
});
