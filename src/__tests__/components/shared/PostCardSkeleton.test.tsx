import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PostCardSkeleton from '@/components/shared/PostCardSkeleton';

describe('PostCardSkeleton Component', () => {
    it('renders a skeleton loader with correct test ID', () => {
        render(<PostCardSkeleton />);

        const skeletonElement = screen.getByTestId('post-skeleton');
        expect(skeletonElement).toBeInTheDocument();
    });

    it('displays loading text', () => {
        render(<PostCardSkeleton />);

        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
});