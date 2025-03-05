import React from 'react';

// Add type definitions for props
interface ButtonProps {
  children?: React.ReactNode;
  className?: string;
  variant?: string;
  size?: string;
  asChild?: boolean;
  [key: string]: any;
}

// Mock React Router
jest.mock('react-router-dom', () => ({
  Outlet: () => <div data-testid="outlet-mock">Outlet Content</div>,
  useNavigate: () => jest.fn(),
  useLocation: () => ({ pathname: '/sign-in' }),
  Link: ({ to, children, ...props }: { to: string; children: React.ReactNode;[key: string]: any }) => (
    <a href={to} data-testid={`link-${to}`} {...props}>{children}</a>
  ),
  NavLink: ({ to, children, ...props }: { to: string; children: React.ReactNode;[key: string]: any }) => (
    <a href={to} data-testid={`navlink-${to}`} {...props}>{children}</a>
  ),
  Routes: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Route: () => null
}));

// Mock Button component
jest.mock('@/components/ui/button', () => ({
  Button: React.forwardRef<HTMLButtonElement, ButtonProps>(({
    children,
    className,
    variant = 'default',
    size = 'default',
    asChild = false,
    ...props
  }, ref) => (
    <button
      data-testid="ui-button"
      data-variant={variant}
      data-size={size}
      className={className}
      ref={ref}
      {...props}
    >
      {children}
    </button>
  )),
  buttonVariants: jest.fn((options: { variant?: string; size?: string; className?: string }) => {
    return `mock-button-class-${options?.variant || 'default'}-${options?.size || 'default'} ${options?.className || ''}`;
  })
}));

// Mock the cn utility function
jest.mock('@/lib/utils', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' ')
}));

// Mock Radix UI Slot component
jest.mock('@radix-ui/react-slot', () => ({
  Slot: ({ children, ...props }: { children: React.ReactElement;[key: string]: any }) =>
    React.cloneElement(children, props)
}));

// Add other global mocks as needed