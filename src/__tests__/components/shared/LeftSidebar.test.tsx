import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import RightSidebar from '@/components/shared/RightSideBar';

// Mock the React Router components
jest.mock('react-router-dom', () => ({
    Link: ({ children, to, className }) => (
        <a href={to} className={className} data-testid={`link-${to}`}>
            {children}
        </a>
    )
}));

// Mock the FollowButton component
jest.mock('@/components/shared/FollowButton', () => ({
    __esModule: true,
    default: ({ userId, className }) => (
        <button
            data-testid={`follow-button-${userId}`}
            className={className}
        >
            Follow
        </button>
    )
}));

// Mock the API queries
jest.mock('@/lib/react-query/queries', () => ({
    useGetTopCreators: () => {
        // Return test data
        return {
            data: [
                {
                    $id: 'user1',
                    name: 'Creator One',
                    username: 'creatorone',
                    imageUrl: '/creator1.jpg',
                    followerCount: 125
                },
                {
                    $id: 'user2',
                    name: 'Creator Two',
                    username: 'creatortwo',
                    imageUrl: '/creator2.jpg',
                    followerCount: 98
                },
                {
                    $id: 'user3',
                    name: 'Creator Three',
                    username: 'creatorthree',
                    imageUrl: null,
                    followerCount: 75
                }
            ],
            isLoading: false
        };
    }
}));

describe('RightSidebar Component', () => {
    it('renders the Top Creators heading', () => {
        render(<RightSidebar />);

        expect(screen.getByText('Top Creators')).toBeInTheDocument();
        expect(screen.getByText('(Most Followed)')).toBeInTheDocument();
    });

    it('renders creator cards for each top creator', () => {
        render(<RightSidebar />);

        // Check if all creator names are displayed
        expect(screen.getByText('Creator One')).toBeInTheDocument();
        expect(screen.getByText('Creator Two')).toBeInTheDocument();
        expect(screen.getByText('Creator Three')).toBeInTheDocument();

        // Check if usernames are displayed with @ prefix
        expect(screen.getByText('@creatorone')).toBeInTheDocument();
        expect(screen.getByText('@creatortwo')).toBeInTheDocument();
        expect(screen.getByText('@creatorthree')).toBeInTheDocument();

        // Check if follower counts are displayed
        expect(screen.getByText('125 followers')).toBeInTheDocument();
        expect(screen.getByText('98 followers')).toBeInTheDocument();
        expect(screen.getByText('75 followers')).toBeInTheDocument();
    });

    it('renders follow buttons for each creator', () => {
        render(<RightSidebar />);

        // Check if follow buttons are present for each creator
        expect(screen.getByTestId('follow-button-user1')).toBeInTheDocument();
        expect(screen.getByTestId('follow-button-user2')).toBeInTheDocument();
        expect(screen.getByTestId('follow-button-user3')).toBeInTheDocument();
    });

    it('renders profile images for creators with images', () => {
        render(<RightSidebar />);

        // Check for profile images for creators with imageUrl
        const profileImages = screen.getAllByRole('img');

        // Should be 2 creators with images
        expect(profileImages.length).toBe(2);

        // Verify the image sources
        expect(profileImages[0]).toHaveAttribute('src', '/creator1.jpg');
        expect(profileImages[1]).toHaveAttribute('src', '/creator2.jpg');
    });

    it('renders initial avatar for creators without images', () => {
        render(<RightSidebar />);

        // Creator Three doesn't have an image, so should show an initial
        const initialDiv = screen.getByText('C'); // First letter of Creator Three
        expect(initialDiv).toBeInTheDocument();
    });

    it('shows loader when loading creators', () => {
        // Override the mock to simulate loading state
        jest.spyOn(require('@/lib/react-query/queries'), 'useGetTopCreators').mockReturnValue({
            data: [],
            isLoading: true
        });

        render(<RightSidebar />);

        // Check for loader
        expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('shows message when no creators are found', () => {
        // Override the mock to return empty data
        jest.spyOn(require('@/lib/react-query/queries'), 'useGetTopCreators').mockReturnValue({
            data: [],
            isLoading: false
        });

        render(<RightSidebar />);

        // Check for no creators message
        expect(screen.getByText('No creators found')).toBeInTheDocument();
    });

    it('applies correct layout classes for grid display', () => {
        render(<RightSidebar />);

        // Check the container has grid classes
        const gridContainer = screen.getByText('Creator One').closest('.grid');
        if (!gridContainer) {
            throw new Error('Grid container not found');
        }
        expect(gridContainer).toHaveClass('grid-cols-2');
        expect(gridContainer).toHaveClass('gap-4');
    });

    it('provides links to creator profiles', () => {
        render(<RightSidebar />);

        // Creator One's profile link should point to their profile
        const creatorOneLink = screen.getByText('Creator One').closest('a');
        if (!creatorOneLink) {
            throw new Error('Creator One link not found');
        }
        expect(creatorOneLink).toHaveAttribute('href', '/profile/user1');

        // Creator Two's profile link should point to their profile
        const creatorTwoLink = screen.getByText('Creator Two').closest('a');
        if (!creatorTwoLink) {
            throw new Error('Creator Two link not found');
        }
        expect(creatorTwoLink).toHaveAttribute('href', '/profile/user2');
    });
});