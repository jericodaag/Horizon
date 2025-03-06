import React, { useState } from 'react';
import { GiphyFetch } from '@giphy/js-fetch-api';
import { Grid } from '@giphy/react-components';
import { Button } from '@/components/ui/button';
import { Search, Loader, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface GiphyPickerProps {
    onGifSelect: (gifUrl: string, gifId: string) => void;
    onClose: () => void;
}

const GiphyPicker: React.FC<GiphyPickerProps> = ({ onGifSelect, onClose }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Initialize Giphy API with my API key
    const gf = new GiphyFetch(import.meta.env.VITE_GIPHY_API_KEY);

    // Handle gif selection
    const handleGifClick = (gif: any) => {
        // Get the original gif URL
        const gifUrl = gif.images.original.url;
        onGifSelect(gifUrl, gif.id);
    };

    // Fetch GIFs (trending or search results)
    const fetchGifs = (offset: number) => {
        setIsLoading(true);
        setError(null);

        // Return the promise directly without any additional error handling here
        // The error handling will happen in a .catch() below
        return (searchQuery
            ? gf.search(searchQuery, { offset, limit: 12 })
            : gf.trending({ offset, limit: 12 })
        ).then(result => {
            setIsLoading(false);
            return result; // Return the proper GifsResult type
        }).catch(err => {
            setIsLoading(false);
            setError('Failed to load GIFs. Please try again.');
            console.error('Giphy fetch error:', err);
            // Instead of returning a different type, throw an error
            // This way the Grid component will handle it internally
            throw err;
        });
    };

    // Handle search input changes
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    return (
        <div className="giphy-picker bg-dark-2 rounded-lg p-4 w-[350px] md:w-[500px] max-w-[90vw] shadow-xl border border-dark-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-light-1 font-bold">Select a GIF</h3>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="text-light-3 hover:text-light-1"
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <div className="relative flex mb-4">
                <Input
                    type="text"
                    placeholder="Search GIFs..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="bg-dark-3 border-none pr-10 w-full"
                />
                <Search className="absolute right-3 top-2.5 text-light-3 w-5 h-5" />
            </div>

            {error && (
                <div className="text-red-500 mb-2 text-center">{error}</div>
            )}

            {isLoading && !error && (
                <div className="flex justify-center py-8">
                    <Loader className="animate-spin h-8 w-8 text-primary-500" />
                </div>
            )}

            <div className="h-[400px] overflow-y-auto custom-scrollbar">
                <Grid
                    width={window.innerWidth > 500 ? 450 : 300}
                    columns={window.innerWidth > 500 ? 2 : 1}
                    fetchGifs={fetchGifs}
                    key={searchQuery}
                    onGifClick={handleGifClick}
                    noLink={true}
                    hideAttribution={false}
                />
            </div>

            <div className="mt-3 text-xs text-center text-light-3">
                Powered by GIPHY
            </div>
        </div>
    );
};

export default GiphyPicker;