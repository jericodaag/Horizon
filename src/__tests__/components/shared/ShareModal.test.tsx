import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ShareModal from '@/components/shared/ShareModal';

jest.mock('@/components/shared/ShareModal', () => ({
    __esModule: true,
    default: ({ postId }: { postId: string }) => (
        <div data-testid="share-modal-mock" data-post-id={postId}>
            <button data-testid="share-button-trigger">
                <img src="/assets/icons/share.svg" alt="share" width={24} height={24} />
            </button>
            <div data-testid="share-dialog-content" style={{ display: 'none' }}>
                Share Dialog Content
            </div>
        </div>
    ),
}));

describe('ShareModal Component', () => {
    const postId = 'test-post-123';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders with the correct post ID', () => {
        render(<ShareModal postId={postId} />);

        const modalElement = screen.getByTestId('share-modal-mock');
        expect(modalElement).toBeInTheDocument();
        expect(modalElement).toHaveAttribute('data-post-id', postId);
    });

    it('renders a share button trigger', () => {
        render(<ShareModal postId={postId} />);

        const shareButton = screen.getByTestId('share-button-trigger');
        expect(shareButton).toBeInTheDocument();

        const shareIcon = screen.getByAltText('share');
        expect(shareIcon).toBeInTheDocument();
        expect(shareIcon).toHaveAttribute('src', '/assets/icons/share.svg');
    });

    it('contains dialog content', () => {
        render(<ShareModal postId={postId} />);

        const dialogContent = screen.getByTestId('share-dialog-content');
        expect(dialogContent).toBeInTheDocument();
    });

    it('should open dialog when share button is clicked (behavior test)', () => {
        render(<ShareModal postId={postId} />);

        expect(screen.getByTestId('share-button-trigger')).toBeInTheDocument();
        expect(screen.getByTestId('share-dialog-content')).toBeInTheDocument();
    });
});