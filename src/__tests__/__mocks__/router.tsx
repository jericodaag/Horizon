import React from 'react';

export const mockNavigate = jest.fn();

export const mockLocation: {
    pathname: string;
    state: any;
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