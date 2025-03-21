import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PostCardSkeleton from '@/components/shared/PostCardSkeleton';

// Unmock the component we're testing
jest.unmock('@/components/shared/PostCardSkeleton');

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
    motion: {
        div: ({ className, children, ...props }) => (
            <div className={`${className} motion-div`} data-testid="motion-div" {...props}>
                {children}
            </div>
        ),
    },
}));

describe('PostCardSkeleton Component', () => {
    it('renders three skeleton loaders', () => {
        render(<PostCardSkeleton />);

        // Check if three skeleton loaders are rendered
        const skeletonLoaders = screen.getAllByTestId('motion-div');

        // There should be multiple motion divs per skeleton (15 per skeleton, so 45 total)
        expect(skeletonLoaders.length).toBeGreaterThan(0);

        // Check if we have three top-level skeleton containers
        const skeletonContainers = document.querySelectorAll('.post-card');
        expect(skeletonContainers.length).toBe(3);
    });

    it('applies the correct classes to skeleton elements', () => {
        render(<PostCardSkeleton />);

        // Check for profile image skeleton
        const profileSkeleton = screen.getAllByTestId('motion-div').find(
            element => element.className.includes('w-14 h-14 rounded-full')
        );
        expect(profileSkeleton).toBeInTheDocument();

        // Check for post image skeleton (large rectangular area)
        const imageSkeleton = screen.getAllByTestId('motion-div').find(
            element => element.className.includes('aspect-square')
        );
        expect(imageSkeleton).toBeInTheDocument();

        // Check for text content skeletons
        const textSkeletons = screen.getAllByTestId('motion-div').filter(
            element => element.className.includes('bg-light-4 rounded') &&
                !element.className.includes('rounded-full') &&
                !element.className.includes('aspect-square')
        );
        expect(textSkeletons.length).toBeGreaterThan(0);
    });

    it('wraps multiple skeletons in a flex container', () => {
        const { container } = render(<PostCardSkeleton />);

        const flexContainer = container.firstChild;
        expect(flexContainer).toHaveClass('flex flex-col gap-9');
    });

    it('assigns unique keys to each skeleton loader', () => {
        // This is a bit tricky to test directly as keys are React-internal
        // But we can check the DOM structure for multiple sibling elements
        const { container } = render(<PostCardSkeleton />);

        const wrapperDiv = container.firstChild;
        expect(wrapperDiv?.childNodes.length).toBe(3);

        // Each child should be a post-card div
        for (let i = 0; i < wrapperDiv!.childNodes.length; i++) {
            const child = wrapperDiv!.childNodes[i];
            expect(child).toHaveClass('post-card');
        }
    });
});