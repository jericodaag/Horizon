import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import SearchResults from '@/components/shared/SearchResults';
import { Models } from 'appwrite';

jest.unmock('@/components/shared/SearchResults');

jest.mock('lucide-react', () => ({
  Loader: () => <div data-testid='loader'>Loading...</div>,
}));

jest.mock('@/components/shared/GridPostList', () => ({
  __esModule: true,
  default: ({ posts }) => (
    <div data-testid='grid-post-list' data-posts-length={posts.length}>
      Grid Posts: {posts.length}
    </div>
  ),
}));

describe('SearchResults Component', () => {
  it('renders loading state when isSearchFetching is true', () => {
    render(
      <SearchResults
        isSearchFetching={true}
        searchedPosts={{ documents: [] }}
      />
    );

    expect(screen.getByTestId('loader')).toBeInTheDocument();
    expect(screen.queryByTestId('grid-post-list')).not.toBeInTheDocument();
    expect(screen.queryByText('No Results Found')).not.toBeInTheDocument();
  });

  it('renders GridPostList when search returns results', () => {
    const mockPosts = [
      { $id: 'post-1' } as Models.Document,
      { $id: 'post-2' } as Models.Document,
    ];

    render(
      <SearchResults
        isSearchFetching={false}
        searchedPosts={{ documents: mockPosts }}
      />
    );

    expect(screen.getByTestId('grid-post-list')).toBeInTheDocument();
    expect(screen.getByText('Grid Posts: 2')).toBeInTheDocument();
    expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    expect(screen.queryByText('No Results Found')).not.toBeInTheDocument();
  });

  it('renders "No Results Found" when search returns empty results', () => {
    render(
      <SearchResults
        isSearchFetching={false}
        searchedPosts={{ documents: [] }}
      />
    );

    expect(screen.getByText('No Results Found')).toBeInTheDocument();
    expect(screen.queryByTestId('grid-post-list')).not.toBeInTheDocument();
    expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
  });
});
