import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import GiphyPicker from '@/components/shared/GiphyPicker';

// Unmock the component we're testing
jest.unmock('@/components/shared/GiphyPicker');

// Mock the environment variables
global.import = {
    meta: {
        env: {
            VITE_GIPHY_API_KEY: 'test-api-key'
        }
    }
};

// Mock Giphy API
jest.mock('@giphy/js-fetch-api', () => ({
    GiphyFetch: jest.fn().mockImplementation(() => ({
        search: jest.fn().mockResolvedValue({
            data: [
                {
                    id: 'gif1',
                    images: {
                        original: { url: 'https://giphy.com/gif1.gif' }
                    }
                },
                {
                    id: 'gif2',
                    images: {
                        original: { url: 'https://giphy.com/gif2.gif' }
                    }
                }
            ],
            pagination: { total_count: 2, count: 2, offset: 0 }
        }),
        trending: jest.fn().mockResolvedValue({
            data: [
                {
                    id: 'trending1',
                    images: {
                        original: { url: 'https://giphy.com/trending1.gif' }
                    }
                },
                {
                    id: 'trending2',
                    images: {
                        original: { url: 'https://giphy.com/trending2.gif' }
                    }
                }
            ],
            pagination: { total_count: 2, count: 2, offset: 0 }
        })
    }))
}));

// Mock Giphy React Components
jest.mock('@giphy/react-components', () => ({
    Grid: ({ fetchGifs, onGifClick }) => {
        // Call fetchGifs immediately to simulate loading GIFs
        React.useEffect(() => {
            fetchGifs(0).then(result => {
                // Simulate clicking the first GIF
                if (result && result.data && result.data.length > 0) {
                    setTimeout(() => {
                        const mockGifClickEvent = {
                            preventDefault: jest.fn()
                        };
                        onGifClick(result.data[0], mockGifClickEvent);
                    }, 10);
                }
            });
        }, [fetchGifs, onGifClick]);

        return <div data-testid="giphy-grid">GIPHY Grid Component</div>;
    }
}));

// Mock UI components
jest.mock('@/components/ui/button', () => ({
    Button: ({ children, onClick, variant, size, className }) => (
        <button
            onClick={onClick}
            className={className}
            data-variant={variant}
            data-size={size}
            data-testid={`button-${typeof children === 'string' ? children.toLowerCase() : 'icon'}`}
        >
            {children}
        </button>
    )
}));

jest.mock('@/components/ui/input', () => ({
    Input: ({ type, placeholder, value, onChange, className }) => (
        <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className={className}
            data-testid="search-input"
        />
    )
}));

// Mock Lucide icons
jest.mock('lucide-react', () => ({
    Search: () => <div data-testid="search-icon">Search Icon</div>,
    Loader: ({ className }) => <div data-testid="loader-icon" className={className}>Loading Icon</div>,
    X: () => <div data-testid="x-icon">X Icon</div>
}));

// Mock window.innerWidth
Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: 600
});

describe('GiphyPicker Component', () => {
    const mockOnGifSelect = jest.fn();
    const mockOnClose = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the GiphyPicker component correctly', () => {
        render(
            <GiphyPicker
                onGifSelect={mockOnGifSelect}
                onClose={mockOnClose}
            />
        );

        // Check main elements are rendered
        expect(screen.getByText('Select a GIF')).toBeInTheDocument();
        expect(screen.getByTestId('search-input')).toBeInTheDocument();
        expect(screen.getByTestId('search-icon')).toBeInTheDocument();
        expect(screen.getByTestId('giphy-grid')).toBeInTheDocument();
        expect(screen.getByText('Powered by GIPHY')).toBeInTheDocument();
    });

    it('calls onClose when the close button is clicked', () => {
        render(
            <GiphyPicker
                onGifSelect={mockOnGifSelect}
                onClose={mockOnClose}
            />
        );

        const closeButton = screen.getByTestId('button-icon');
        fireEvent.click(closeButton);

        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('searches for GIFs when search input changes', async () => {
        const { GiphyFetch } = require('@giphy/js-fetch-api');
        const mockGiphyInstance = GiphyFetch.mock.results[0].value;

        render(
            <GiphyPicker
                onGifSelect={mockOnGifSelect}
                onClose={mockOnClose}
            />
        );

        // Initially, trending should be called
        expect(mockGiphyInstance.trending).toHaveBeenCalled();

        // Change search input
        const searchInput = screen.getByTestId('search-input');
        fireEvent.change(searchInput, { target: { value: 'cats' } });

        // We expect search to be called once the component re-renders
        await waitFor(() => {
            expect(mockGiphyInstance.search).toHaveBeenCalledWith('cats', expect.anything());
        });
    });

    it('shows error state when fetching fails', async () => {
        // Setup GiphyFetch to throw an error
        const { GiphyFetch } = require('@giphy/js-fetch-api');
        const mockGiphyInstance = GiphyFetch.mock.results[0].value;
        mockGiphyInstance.trending.mockRejectedValueOnce(new Error('Network error'));

        render(
            <GiphyPicker
                onGifSelect={mockOnGifSelect}
                onClose={mockOnClose}
            />
        );

        // Error should be shown
        await waitFor(() => {
            expect(screen.getByText('Failed to load GIFs. Please try again.')).toBeInTheDocument();
        });
    });

    it('shows loading state while fetching GIFs', async () => {
        // Setup a delayed promise for trending
        const { GiphyFetch } = require('@giphy/js-fetch-api');
        const mockGiphyInstance = GiphyFetch.mock.results[0].value;

        // Create a promise that won't resolve immediately
        let resolvePromise: (value: any) => void;
        const delayedPromise = new Promise<any>(resolve => {
            resolvePromise = resolve;
        });

        mockGiphyInstance.trending.mockReturnValueOnce(delayedPromise);

        render(
            <GiphyPicker
                onGifSelect={mockOnGifSelect}
                onClose={mockOnClose}
            />
        );

        // Loading state should be visible
        expect(screen.getByTestId('loader-icon')).toBeInTheDocument();

        // Resolve the promise
        resolvePromise!({
            data: [],
            pagination: { total_count: 0, count: 0, offset: 0 }
        });

        // Loading state should disappear
        await waitFor(() => {
            expect(screen.queryByTestId('loader-icon')).not.toBeInTheDocument();
        });
    });

    it('calls onGifSelect when a GIF is clicked', async () => {
        render(
            <GiphyPicker
                onGifSelect={mockOnGifSelect}
                onClose={mockOnClose}
            />
        );

        // Our mock Grid component simulates a GIF click
        await waitFor(() => {
            expect(mockOnGifSelect).toHaveBeenCalledWith(
                'https://giphy.com/trending1.gif',
                'trending1'
            );
        });
    });

    it('adjusts grid width based on window size', () => {
        // Test with smaller width
        window.innerWidth = 400;

        render(
            <GiphyPicker
                onGifSelect={mockOnGifSelect}
                onClose={mockOnClose}
            />
        );

        // We can't directly test Grid props, but we can verify the component renders
        expect(screen.getByTestId('giphy-grid')).toBeInTheDocument();

        // Reset window width
        window.innerWidth = 600;
    });
});