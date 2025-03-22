import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import GiphyPicker from '@/components/shared/GiphyPicker';

jest.mock('@/lib/api-config', () => ({
  giphyConfig: {
    apiKey: 'test-api-key',
  },
}));

const mockSearch = jest.fn();
const mockTrending = jest.fn();

jest.mock('@giphy/js-fetch-api', () => ({
  GiphyFetch: jest.fn().mockImplementation(() => ({
    search: mockSearch,
    trending: mockTrending,
  })),
}));

jest.mock('@giphy/react-components', () => ({
  Grid: () => <div data-testid='giphy-grid'>GIPHY Grid Component</div>,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick }) => (
    <button onClick={onClick} data-testid='close-button'>
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/input', () => ({
  Input: (props) => <input {...props} data-testid='search-input' />,
}));

jest.mock('lucide-react', () => ({
  Search: () => <div>Search Icon</div>,
  Loader: () => <div>Loading</div>,
  X: () => <div>X</div>,
}));

describe('GiphyPicker Component', () => {
  const mockOnGifSelect = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockTrending.mockResolvedValue({
      data: [],
      pagination: { total_count: 0, count: 0, offset: 0 },
    });

    mockSearch.mockResolvedValue({
      data: [],
      pagination: { total_count: 0, count: 0, offset: 0 },
    });
  });

  it('renders the GiphyPicker UI elements', () => {
    render(<GiphyPicker onGifSelect={mockOnGifSelect} onClose={mockOnClose} />);

    expect(screen.getByText('Select a GIF')).toBeInTheDocument();
    expect(screen.getByTestId('search-input')).toBeInTheDocument();
    expect(screen.getByTestId('giphy-grid')).toBeInTheDocument();
    expect(screen.getByText('Powered by GIPHY')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(<GiphyPicker onGifSelect={mockOnGifSelect} onClose={mockOnClose} />);

    fireEvent.click(screen.getByTestId('close-button'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('updates search query when typing in search box', () => {
    render(<GiphyPicker onGifSelect={mockOnGifSelect} onClose={mockOnClose} />);

    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, { target: { value: 'test query' } });

    expect(searchInput).toHaveValue('test query');
  });
});
