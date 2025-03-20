import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Bottombar from '@/components/shared/BottomBar';
import { bottombarLinks } from '@/constants';

// Mock the router
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useLocation: () => ({
        pathname: '/explore'
    })
}));

describe('Bottombar Component', () => {
    it('renders all navigation links', () => {
        render(<Bottombar />);

        // Check if all bottombar links from constants are rendered
        bottombarLinks.forEach((link) => {
            expect(screen.getByText(link.label)).toBeInTheDocument();
        });
    });

    it('applies active class to the current route', () => {
        render(<Bottombar />);

        // Find the active link (should be Explore based on our mock)
        const exploreLink = screen.getByText('Explore').closest('a');

        // Check if active link has the bg-primary-500 class
        expect(exploreLink).toHaveClass('bg-primary-500');

        // Check if other links don't have the active class
        const otherLinks = bottombarLinks.filter(link => link.route !== '/explore');
        otherLinks.forEach(link => {
            const linkElement = screen.getByText(link.label).closest('a');
            expect(linkElement).not.toHaveClass('bg-primary-500');
        });
    });

    it('applies invert-white class to the icon of active route', () => {
        render(<Bottombar />);

        // Find all link images
        const linkImages = document.querySelectorAll('img');

        // Loop through images to check if active link's image has invert-white class
        linkImages.forEach((img) => {
            // If this is the image for the Explore link, it should have invert-white class
            if (img.alt === 'Explore') {
                expect(img).toHaveClass('invert-white');
            } else {
                expect(img).not.toHaveClass('invert-white');
            }
        });
    });

    it('renders with different active route when location changes', () => {
        // Mock a different route
        jest.spyOn(require('react-router-dom'), 'useLocation').mockReturnValue({
            pathname: '/saved'
        });

        render(<Bottombar />);

        // Find the active link (should be Saved now)
        const savedLink = screen.getByText('Saved').closest('a');

        // Check if active link has the bg-primary-500 class
        expect(savedLink).toHaveClass('bg-primary-500');

        // Find the saved icon and check if it has invert-white class
        const savedIcon = document.querySelector('img[alt="Saved"]');
        expect(savedIcon).toHaveClass('invert-white');
    });
});