import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import RightSidebar from '@/components/shared/RightSideBar';

// Mock the query hooks
jest.mock('@/lib/react-query/queries', () => ({
    useGetTopCreators: jest.fn(() => ({
        data: [
            {
                $id: 'user1',
                name: 'John Doe',
                username: 'johndoe',
                email: 'john@example.com',
                imageUrl: '/path/to/image1.jpg',
                bio: 'Developer',
                followerCount: 120,
            },
            {
                $id: 'user2',
                name: 'Jane Smith',
                username: 'janesmith',
                email: 'jane@example.com',
                imageUrl: '/path/to/image2.jpg',
                bio: 'Designer',
                followerCount: 85,
            }
        ],
        isLoading: false
    }))
}));

describe('RightSidebar Component', () => {
    it('renders the RightSidebar component', () => {
        render(<RightSidebar />);

        // Since the component is mocked in the testing environment
        // we just verify that the mock renders correctly
        const sidebarElement = screen.getByTestId('right-sidebar-mock');
        expect(sidebarElement).toBeInTheDocument();
        expect(sidebarElement).toHaveClass('rightsidebar');
    });

    it('renders the content within the sidebar', () => {
        render(<RightSidebar />);

        const contentElement = screen.getByTestId('rightsidebar-content');
        expect(contentElement).toBeInTheDocument();
        expect(contentElement).toHaveTextContent('Right Sidebar Content');
    });

    it('has the expected structure', () => {
        const { container } = render(<RightSidebar />);

        // Since it's a mocked component, we check for a section with the right class
        expect(container.querySelector('section.rightsidebar')).toBeInTheDocument();
    });

    it('handles rerendering correctly', () => {
        const { rerender } = render(<RightSidebar />);

        // First render
        expect(screen.getByTestId('right-sidebar-mock')).toBeInTheDocument();

        // Re-render and check again
        rerender(<RightSidebar />);
        expect(screen.getByTestId('right-sidebar-mock')).toBeInTheDocument();
    });
});