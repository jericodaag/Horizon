import React from 'react';

// Type definitions
interface ButtonProps {
  children?: React.ReactNode;
  className?: string;
  variant?: string;
  size?: string;
  asChild?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  [key: string]: any;
}

interface InputProps {
  type?: string;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value?: string;
  [key: string]: any;
}

export const mockNavigate = jest.fn();
export const mockSignInAccount = jest.fn();
export const mockCreateUserAccount = jest.fn();
export const mockCheckAuthUser = jest.fn();
export const mockToast = jest.fn();

jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/sign-in' }),
  Outlet: () => <div data-testid="outlet-mock">Outlet Content</div>,
  Link: ({ to, children, ...props }: { to: string; children: React.ReactNode;[key: string]: any }) => (
    <a href={to} data-testid={`link-${to}`} {...props}>{children}</a>
  ),
  NavLink: ({ to, children, ...props }: { to: string; children: React.ReactNode;[key: string]: any }) => (
    <a href={to} data-testid={`navlink-${to}`} {...props}>{children}</a>
  ),
  Routes: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Route: () => null
}));

jest.mock('@/lib/react-query/queries', () => ({
  useSignInAccount: () => ({
    mutateAsync: mockSignInAccount,
    isPending: false
  }),
  useCreateUserAccount: () => ({
    mutateAsync: mockCreateUserAccount,
    isPending: false
  }),
  useGetPosts: () => ({
    data: null,
    fetchNextPage: jest.fn(),
    hasNextPage: false
  }),
  useSearchPosts: () => ({
    data: null,
    isFetching: false
  })
}));

jest.mock('@/context/AuthContext', () => ({
  useUserContext: () => ({
    user: null,
    isLoading: false,
    isAuthenticated: false,
    checkAuthUser: mockCheckAuthUser,
    setUser: jest.fn(),
    signOut: jest.fn()
  })
}));

jest.mock('@/components/ui/button', () => ({
  Button: React.forwardRef<HTMLButtonElement, ButtonProps>(({
    children,
    className,
    variant = 'default',
    size = 'default',
    asChild = false,
    disabled = false,
    type = 'button',
    onClick,
    ...props
  }, ref) => (
    <button
      data-testid="ui-button"
      data-variant={variant}
      data-size={size}
      className={className}
      disabled={disabled}
      type={type}
      onClick={onClick}
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

jest.mock('@/components/ui/input', () => ({
  Input: React.forwardRef<HTMLInputElement, InputProps>(({
    type = 'text',
    className,
    placeholder,
    disabled = false,
    onChange,
    value,
    ...props
  }, ref) => (
    <input
      data-testid={`input-${type}`}
      type={type}
      className={className}
      placeholder={placeholder}
      disabled={disabled}
      onChange={onChange}
      value={value}
      ref={ref}
      {...props}
    />
  ))
}));

jest.mock('@/components/ui/form', () => ({
  Form: ({ children, ...props }: any) => <form data-testid="shadcn-form" {...props}>{children}</form>,
  FormControl: ({ children }: any) => <div data-testid="form-control">{children}</div>,
  FormField: ({ name, render }: any) => {
    const field = {
      name,
      value: name === 'email' ? 'test@example.com' :
        name === 'password' ? 'password123' :
          name === 'name' ? 'Test User' : 'testuser',
      onChange: jest.fn(),
      onBlur: jest.fn(),
      ref: jest.fn()
    };
    return render({ field });
  },
  FormItem: ({ children }: any) => <div data-testid="form-item">{children}</div>,
  FormLabel: ({ children }: any) => <label>{children}</label>,
  FormMessage: () => <div data-testid="form-message"></div>
}));

jest.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
  Toast: ({ children }: any) => <div data-testid="toast">{children}</div>,
  ToastAction: ({ children }: any) => <button data-testid="toast-action">{children}</button>,
  ToastClose: () => <button data-testid="toast-close">×</button>,
  ToastDescription: ({ children }: any) => <div data-testid="toast-description">{children}</div>,
  ToastProvider: ({ children }: any) => <div data-testid="toast-provider">{children}</div>,
  ToastTitle: ({ children }: any) => <div data-testid="toast-title">{children}</div>,
  ToastViewport: () => <div data-testid="toast-viewport" />
}));

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div data-testid="motion-div" {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button data-testid="motion-button" {...props}>{children}</button>,
    img: ({ ...props }: any) => <img data-testid="motion-img" {...props} />,
    h1: ({ children, ...props }: any) => <h1 data-testid="motion-h1" {...props}>{children}</h1>,
    p: ({ children, ...props }: any) => <p data-testid="motion-p" {...props}>{children}</p>
  },
  AnimatePresence: ({ children }: any) => <>{children}</>
}));

jest.mock('@/components/shared/Loader', () => ({
  __esModule: true,
  default: () => <div data-testid="loader">Loading...</div>
}));

jest.mock('@/components/shared/GridPostList', () => ({
  __esModule: true,
  default: ({ posts }: { posts: any[] }) => (
    <div data-testid="grid-post-list">
      {posts.map((post) => (
        <div key={post.$id} data-testid="post-item" data-post-id={post.$id}>
          {post.caption}
        </div>
      ))}
    </div>
  )
}));

// Mock React Hook Form minimally
jest.mock('react-hook-form', () => {
  const actual = jest.requireActual('react-hook-form');
  return {
    ...actual,
    useForm: () => ({
      ...actual.useForm(),
      handleSubmit: (callback: any) => (e: any) => {
        e?.preventDefault?.();
        return callback({
          name: 'Test User',
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123'
        });
      }
    })
  };
});

jest.mock('react-intersection-observer', () => ({
  useInView: () => ({ ref: jest.fn(), inView: false })
}));

jest.mock('@/lib/utils', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' ')
}));

jest.mock('@radix-ui/react-slot', () => ({
  Slot: ({ children, ...props }: { children: React.ReactElement;[key: string]: any }) =>
    React.cloneElement(children, props)
}));