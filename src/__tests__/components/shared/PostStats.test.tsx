import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PostStats from '@/components/shared/PostStats';
import { BrowserRouter } from 'react-router-dom';
import * as reactQuery from '@/lib/react-query/queries';
import * as utils from '@/lib/utils';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    img: ({ src, alt, width, height, className, ...props }) => (
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        {...props}
      />
    ),
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
  },
}));

jest.mock('@/components/shared/ShareModal', () => ({
  __esModule: true,
  default: ({ postId }) => (
    <button data-testid="share-button" data-postid={postId}>
      Share
    </button>
  ),
}));

jest.mock('@/lib/react-query/queries', () => ({
  useLikePost: jest.fn(),
  useSavePost: jest.fn(),
  useDeleteSavedPost: jest.fn(),
  useGetCurrentUser: jest.fn(),
  useGetPostComments: jest.fn(),
}));

jest.mock('@/lib/utils', () => ({
  checkIsLiked: jest.fn(),
}));

describe('PostStats Component', () => {
  const mockPost = {
    $id: 'post-123',
    $createdAt: '2023-01-01T12:00:00.000Z',
    $updatedAt: '2023-01-01T12:00:00.000Z',
    $permissions: [],
    $collectionId: 'posts',
    $databaseId: 'database',
    likes: ['user-1', 'user-2'],
    creator: {
      $id: 'creator-123',
      name: 'Creator Name',
    },
    caption: 'Test post',
    imageUrl: 'https://example.com/image.jpg',
    location: 'Test location',
    tags: ['test']
  };

  const userId = 'user-123';

  beforeEach(() => {
    jest.clearAllMocks();

    jest.mocked(reactQuery.useLikePost).mockReturnValue({
      mutate: jest.fn(),
      isLoading: false,
    } as any);

    jest.mocked(reactQuery.useSavePost).mockReturnValue({
      mutate: jest.fn(),
      isLoading: false,
    } as any);

    jest.mocked(reactQuery.useDeleteSavedPost).mockReturnValue({
      mutate: jest.fn(),
      isLoading: false,
    } as any);

    jest.mocked(reactQuery.useGetCurrentUser).mockReturnValue({
      data: {
        $id: userId,
        save: []
      },
      isLoading: false,
    } as any);

    jest.mocked(reactQuery.useGetPostComments).mockReturnValue({
      data: {
        documents: [],
        total: 0
      },
      isLoading: false,
    } as any);

    jest.mocked(utils.checkIsLiked).mockReturnValue(false);
  });

  it('renders with the correct test ID', () => {
    render(
      <BrowserRouter>
        <PostStats post={mockPost} userId={userId} />
      </BrowserRouter>
    );

    const postStatsElement = screen.getByTestId(`post-stats-${mockPost.$id}`);
    expect(postStatsElement).toBeInTheDocument();
  });

  it('displays the like count text', () => {
    render(
      <BrowserRouter>
        <PostStats post={mockPost} userId={userId} />
      </BrowserRouter>
    );

    const likesText = screen.getByText(/2 likes/i);
    expect(likesText).toBeInTheDocument();
  });

  it('renders differently in grid view mode', () => {
    render(
      <BrowserRouter>
        <PostStats post={mockPost} userId={userId} isGridView={true} />
      </BrowserRouter>
    );

    const gridViewElement = screen.getByTestId(`post-stats-${mockPost.$id}`).querySelector('[data-is-grid-view="true"]');
    expect(gridViewElement).toBeInTheDocument();
  });

  it('passes the likes array to the component', () => {
    const customPost = {
      ...mockPost,
      likes: ['user-1', 'user-2', 'user-3', 'user-4']
    };

    render(
      <BrowserRouter>
        <PostStats post={customPost} userId={userId} />
      </BrowserRouter>
    );

    // Should show 4 likes
    const likesText = screen.getByText(/4 likes/i);
    expect(likesText).toBeInTheDocument();
  });
});