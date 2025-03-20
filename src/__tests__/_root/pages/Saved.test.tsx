import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Saved from '@/_root/pages/Saved';

// Import specific mocks we'll configure for this test
import { mockGetSavedPosts } from '@/__tests__/__mocks__/api';

describe('Saved Component', () => {
    // Mock saved posts data
    const mockSavedPostsData = [
        {
            $id: 'post1',
            caption: 'Test post 1',
            imageUrl: 'https://example.com/post1.jpg',
            creator: { $id: 'user2', name: 'Other User' }
        },
        {
            $id: 'post2',
            caption: 'Test post 2',
            imageUrl: 'https://example.com/post2.jpg',
            creator: { $id: 'user3', name: 'Another User' }
        }
    ];

    beforeEach(() => {
        jest.clearAllMocks();

        // Default mock implementation
        mockGetSavedPosts.mockReturnValue({
            data: mockSavedPostsData,
            isLoading: false
        });
    });

    it('renders the saved posts page with title', () => {
        render(<Saved />);

        // Check for the title
        expect(screen.getByText('Saved Posts')).toBeInTheDocument();

        // Check for the save icon
        const saveIcon = screen.getByAltText('save');
        expect(saveIcon).toBeInTheDocument();
        expect(saveIcon).toHaveAttribute('src', '/assets/icons/save.svg');
    });

    it('shows loading state when fetching saved posts', () => {
        // Mock loading state
        mockGetSavedPosts.mockReturnValue({
            data: null,
            isLoading: true
        });

        render(<Saved />);

        // Check for loader
        expect(screen.getByTestId('loader')).toBeInTheDocument();

        // Saved posts title should not be visible during loading
        expect(screen.queryByText('Saved Posts')).not.toBeInTheDocument();
    });

    it('displays saved posts when data is loaded', () => {
        render(<Saved />);

        // Check if grid post list is rendered
        const gridPostList = screen.getByTestId('grid-post-list');
        expect(gridPostList).toBeInTheDocument();

        // Check that it passes the correct props
        expect(gridPostList).toHaveAttribute('data-showuser', 'true');
        expect(gridPostList).toHaveAttribute('data-showstats', 'true');

        // We can see the specific posts rendered
        expect(screen.getAllByTestId(/^post-/)).toHaveLength(2);
    });

    it('shows empty state when no saved posts', () => {
        // Mock empty saved posts
        mockGetSavedPosts.mockReturnValue({
            data: [],
            isLoading: false
        });

        render(<Saved />);

        // Check for empty state message
        expect(screen.getByText('No saved posts yet')).toBeInTheDocument();

        // Check for the empty state icon
        const emptyStateIconContainer = screen.getByText('No saved posts yet').parentElement;
        const emptyStateIcon = emptyStateIconContainer?.querySelector('img[alt="save"]');
        expect(emptyStateIcon).toBeInTheDocument();
        expect(emptyStateIcon).toHaveClass('opacity-50');

        // Grid post list should not be rendered
        expect(screen.queryByTestId('grid-post-list')).not.toBeInTheDocument();
    });

    it('handles null data response correctly', () => {
        // Mock null data response (different from empty array)
        mockGetSavedPosts.mockReturnValue({
            data: null,
            isLoading: false
        });

        render(<Saved />);

        // Should show empty state
        expect(screen.getByText('No saved posts yet')).toBeInTheDocument();
    });
});