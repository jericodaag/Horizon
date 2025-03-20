import React from 'react';

// Export mock functions so tests can configure them
export const mockNavigate = jest.fn();

// Change the type definition for mockLocation to allow for state to be any type
export const mockLocation: {
    pathname: string;
    state: any; // Changed from null to any to allow different state types
} = {
    pathname: '/sign-in',
    state: null
};

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation,
    useParams: () => ({}),
    Outlet: () => <div data-testid="outlet-mock">Outlet Content</div>,
    Link: ({ to, children, className, ...props }: { to: string; children: React.ReactNode; className?: string;[key: string]: any }) => (
        <a href={to} data-testid={`link-${to}`} className={className} {...props}>{children}</a>
    ),
    NavLink: ({ to, children, ...props }: { to: string; children: React.ReactNode;[key: string]: any }) => (
        <a href={to} data-testid={`navlink-${to}`} {...props}>{children}</a>
    ),
    Routes: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    Route: () => null
}));