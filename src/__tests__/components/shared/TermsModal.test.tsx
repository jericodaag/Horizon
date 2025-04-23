import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TermsModal from '@/components/shared/TermsModal';

// Mock dependencies
jest.mock('lucide-react', () => ({
    X: () => <div data-testid="x-icon">X Icon</div>
}));

jest.mock('framer-motion', () => ({
    motion: {
        div: ({
            children,
            className,
            onClick
        }: {
            children?: React.ReactNode,
            className?: string,
            onClick?: () => void,
            initial?: any,
            animate?: any,
            exit?: any,
            transition?: any
        }) => (
            <div
                data-testid="motion-div"
                className={className}
                onClick={onClick}
            >
                {children}
            </div>
        )
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

describe('TermsModal Component', () => {
    const mockOnClose = jest.fn();

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should not render when isOpen is false', () => {
        render(
            <TermsModal
                isOpen={false}
                onClose={mockOnClose}
                type="terms"
            />
        );

        expect(screen.queryByText('Terms of Service')).not.toBeInTheDocument();
    });

    it('should render terms content when type is "terms" and isOpen is true', () => {
        render(
            <TermsModal
                isOpen={true}
                onClose={mockOnClose}
                type="terms"
            />
        );

        expect(screen.getByText('Terms of Service')).toBeInTheDocument();
        expect(screen.getByText(/These Terms of Use reflect the way Horizon works/)).toBeInTheDocument();
        expect(screen.getByText('The Horizon Service')).toBeInTheDocument();
        expect(screen.getByText('Your Commitments')).toBeInTheDocument();
    });

    it('should render privacy content when type is "privacy" and isOpen is true', () => {
        render(
            <TermsModal
                isOpen={true}
                onClose={mockOnClose}
                type="privacy"
            />
        );

        expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
        expect(screen.getByText(/We want you to understand how and why Horizon collects/)).toBeInTheDocument();
        expect(screen.getByText('Information We Collect')).toBeInTheDocument();
        expect(screen.getByText('How We Use Information')).toBeInTheDocument();
        expect(screen.getByText('How We Share Information')).toBeInTheDocument();
    });

    it('should call onClose when clicking the X button', () => {
        render(
            <TermsModal
                isOpen={true}
                onClose={mockOnClose}
                type="terms"
            />
        );

        const closeButton = screen.getByLabelText('Close modal');
        fireEvent.click(closeButton);

        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when clicking the Close button in footer', () => {
        render(
            <TermsModal
                isOpen={true}
                onClose={mockOnClose}
                type="terms"
            />
        );

        const closeButton = screen.getByText('Close');
        fireEvent.click(closeButton);

        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when clicking the backdrop', () => {
        render(
            <TermsModal
                isOpen={true}
                onClose={mockOnClose}
                type="terms"
            />
        );

        // Get the first motion-div which should be the backdrop
        const backdropElements = screen.getAllByTestId('motion-div');
        const backdrop = backdropElements[0]; // First motion-div is the backdrop

        fireEvent.click(backdrop);

        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should display list items for terms content', () => {
        render(
            <TermsModal
                isOpen={true}
                onClose={mockOnClose}
                type="terms"
            />
        );

        // Check that list items are displayed
        expect(screen.getByText(/Offering personalized opportunities/)).toBeInTheDocument();
        expect(screen.getByText(/Fostering a positive, inclusive/)).toBeInTheDocument();
        expect(screen.getByText(/Developing and using technologies/)).toBeInTheDocument();
        expect(screen.getByText(/Providing consistent and seamless experiences/)).toBeInTheDocument();
    });

    it('should display list items for privacy content', () => {
        render(
            <TermsModal
                isOpen={true}
                onClose={mockOnClose}
                type="privacy"
            />
        );

        // Check that list items are displayed
        expect(screen.getByText(/Information you provide to us directly/)).toBeInTheDocument();
        expect(screen.getByText(/Information we collect when you use our services/)).toBeInTheDocument();
        expect(screen.getByText(/Information we obtain from other sources/)).toBeInTheDocument();
        expect(screen.getByText(/Provide, personalize, and improve our services/)).toBeInTheDocument();
    });

    it('should have the proper accessibility attributes', () => {
        render(
            <TermsModal
                isOpen={true}
                onClose={mockOnClose}
                type="terms"
            />
        );

        const closeButton = screen.getByLabelText('Close modal');
        expect(closeButton).toHaveAttribute('aria-label', 'Close modal');
    });

    it('should have proper styling classes applied', () => {
        render(
            <TermsModal
                isOpen={true}
                onClose={mockOnClose}
                type="terms"
            />
        );

        // Test for modal container styling
        const modalContainers = screen.getAllByTestId('motion-div');
        const modalContent = modalContainers[1]; // Second motion-div is modal content
        expect(modalContent).toHaveClass('bg-dark-2');
        expect(modalContent).toHaveClass('rounded-lg');

        // Test for header styling
        const header = screen.getByText('Terms of Service').closest('div');
        expect(header).toHaveClass('border-b');
        expect(header).toHaveClass('border-dark-4');

        // Test for footer styling
        const footer = screen.getByText('Close').closest('div');
        expect(footer).toHaveClass('border-t');
        expect(footer).toHaveClass('border-dark-4');

        // Test for close button styling
        const closeButton = screen.getByText('Close');
        expect(closeButton).toHaveClass('bg-primary-500');
    });
});