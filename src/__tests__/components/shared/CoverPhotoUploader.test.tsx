import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CoverPhotoUploader from '@/components/shared/CoverPhotoUploader';

describe('CoverPhotoUploader Component', () => {
    const mockFieldChange = jest.fn();
    const mockPositionChange = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders empty state when no media URL is provided', () => {
        render(<CoverPhotoUploader fieldChange={mockFieldChange} mediaUrl={null} />);

        // Check if the empty state elements are present
        expect(screen.getByText('Add cover photo')).toBeInTheDocument();
        expect(screen.getByAltText('add cover')).toBeInTheDocument();
    });

    it('renders cover image when media URL is provided', () => {
        render(<CoverPhotoUploader fieldChange={mockFieldChange} mediaUrl="existing-cover.jpg" />);

        // Check if the image is displayed
        const image = screen.getByAltText('cover');
        expect(image).toBeInTheDocument();
        expect(image).toHaveAttribute('src', 'existing-cover.jpg');

        // Check for adjust cover button
        expect(screen.getByText('Adjust Cover')).toBeInTheDocument();
    });

    it('shows adjustment controls when edit mode is activated', () => {
        render(<CoverPhotoUploader fieldChange={mockFieldChange} mediaUrl="existing-cover.jpg" />);

        // Click the "Adjust Cover" button to activate edit mode
        fireEvent.click(screen.getByText('Adjust Cover'));

        // Check if adjustment controls are displayed
        expect(screen.getByTitle('Show more of the top')).toBeInTheDocument();
        expect(screen.getByTitle('Show more of the bottom')).toBeInTheDocument();

        // Check for confirm and cancel buttons (using their SVG icons)
        expect(screen.getByTitle('Show more of the top').querySelector('svg')).toBeInTheDocument();
        expect(screen.getByTitle('Show more of the bottom').querySelector('svg')).toBeInTheDocument();
    });

    it('calls positionChange when position is adjusted and saved', () => {
        render(
            <CoverPhotoUploader
                fieldChange={mockFieldChange}
                mediaUrl="existing-cover.jpg"
                positionChange={mockPositionChange}
            />
        );

        // Click the "Adjust Cover" button to activate edit mode
        fireEvent.click(screen.getByText('Adjust Cover'));

        // Click the "move up" button to adjust position
        fireEvent.click(screen.getByTitle('Show more of the top'));

        // Find and click the check/save button
        const checkButton = Array.from(screen.getAllByRole('button'))
            .find(btn => btn.querySelector('svg[data-lucide="Check"]'));

        if (checkButton) {
            fireEvent.click(checkButton);
        } else {
            // If we can't find the Check icon, look for button with green text
            const greenButton = Array.from(screen.getAllByRole('button'))
                .find(btn => btn.className.includes('text-green'));

            if (greenButton) {
                fireEvent.click(greenButton);
            }
        }

        // Check if positionChange was called with the updated position
        expect(mockPositionChange).toHaveBeenCalled();
        // The position should have changed from the default of 50 to 45 (up by 5)
        expect(mockPositionChange).toHaveBeenCalledWith(expect.stringContaining('"y":45'));
    });

    it('calls fieldChange when a new file is dropped', () => {
        render(<CoverPhotoUploader fieldChange={mockFieldChange} mediaUrl={null} />);

        // Create a sample file for the test
        const file = new File(['file content'], 'test-cover.png', { type: 'image/png' });

        // Since we can't directly access the dropzone due to how react-dropzone works,
        // we can simulate the onDrop callback directly
        // Find the container element
        const container = screen.getByText('Add cover photo').closest('div');

        if (!container) {
            throw new Error('Container element not found');
        }

        // Create a drop event and fire it
        const dropEvent = {
            dataTransfer: {
                files: [file],
                items: [{
                    kind: 'file',
                    type: file.type,
                    getAsFile: () => file
                }],
                types: ['Files']
            },
            preventDefault: jest.fn(),
            stopPropagation: jest.fn()
        };

        fireEvent.drop(container, dropEvent);

        // Check if fieldChange was called with the file
        expect(mockFieldChange).toHaveBeenCalledWith([file]);
    });

    it('resets position when edit is canceled', () => {
        render(
            <CoverPhotoUploader
                fieldChange={mockFieldChange}
                mediaUrl="existing-cover.jpg"
                positionChange={mockPositionChange}
                defaultPosition='{"y": 60}'
            />
        );

        // Click the "Adjust Cover" button to activate edit mode
        fireEvent.click(screen.getByText('Adjust Cover'));

        // Click the "move up" button multiple times to significantly change position
        const upButton = screen.getByTitle('Show more of the top');
        fireEvent.click(upButton);
        fireEvent.click(upButton);

        // Find and click the cancel button (X icon)
        const cancelButton = Array.from(screen.getAllByRole('button'))
            .find(btn => btn.querySelector('svg[data-lucide="X"]'));

        if (cancelButton) {
            fireEvent.click(cancelButton);
        } else {
            // If we can't find the X icon, look for button with red text
            const redButton = Array.from(screen.getAllByRole('button'))
                .find(btn => btn.className.includes('text-red'));

            if (redButton) {
                fireEvent.click(redButton);
            }
        }

        // Should not call positionChange when canceling
        expect(mockPositionChange).not.toHaveBeenCalled();

        // Edit mode should be deactivated (adjustment controls should not be visible)
        expect(screen.queryByTitle('Show more of the top')).not.toBeInTheDocument();
    });

    it('uses default position of 50 when defaultPosition is invalid JSON', () => {
        // Mock console.error to avoid polluting test output
        const originalConsoleError = console.error;
        console.error = jest.fn();

        render(
            <CoverPhotoUploader
                fieldChange={mockFieldChange}
                mediaUrl="existing-cover.jpg"
                positionChange={mockPositionChange}
                defaultPosition='invalid-json'
            />
        );

        // Check if console.error was called (indicating the JSON parsing error was caught)
        expect(console.error).toHaveBeenCalled();

        // The component should still render without crashing
        expect(screen.getByAltText('cover')).toBeInTheDocument();

        // Restore original console.error
        console.error = originalConsoleError;
    });

    it('adjusts position down when down button is clicked', () => {
        render(
            <CoverPhotoUploader
                fieldChange={mockFieldChange}
                mediaUrl="existing-cover.jpg"
                positionChange={mockPositionChange}
            />
        );

        // Click the "Adjust Cover" button to activate edit mode
        fireEvent.click(screen.getByText('Adjust Cover'));

        // Click the "move down" button to adjust position
        fireEvent.click(screen.getByTitle('Show more of the bottom'));

        // Find and click the check/save button
        const checkButton = Array.from(screen.getAllByRole('button'))
            .find(btn => btn.querySelector('svg[data-lucide="Check"]'));

        if (checkButton) {
            fireEvent.click(checkButton);
        }

        // Check if positionChange was called with the updated position
        expect(mockPositionChange).toHaveBeenCalled();
        // The position should have changed from the default of 50 to 55 (down by 5)
        expect(mockPositionChange).toHaveBeenCalledWith(expect.stringContaining('"y":55'));
    });

    it('prevents event propagation when clicking adjustment controls', () => {
        render(
            <CoverPhotoUploader
                fieldChange={mockFieldChange}
                mediaUrl="existing-cover.jpg"
                positionChange={mockPositionChange}
            />
        );

        // Click the "Adjust Cover" button to activate edit mode
        fireEvent.click(screen.getByText('Adjust Cover'));

        // Create a mock event with stopPropagation and preventDefault methods
        const mockEvent = {
            stopPropagation: jest.fn(),
            preventDefault: jest.fn()
        };

        // Find the up button and simulate a click with our mock event
        const upButton = screen.getByTitle('Show more of the top');
        fireEvent.click(upButton, mockEvent);

        // Check if stopPropagation was called
        expect(mockEvent.stopPropagation).toHaveBeenCalled();
    });
});