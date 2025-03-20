// Export mock functions
export const mockToast = jest.fn();

// Mock UI components - Button
jest.mock('@/components/ui/button', () => ({
    Button: ({ children, className, variant = 'default', size = 'default', onClick, ...props }: any) => (
        <button
            data-testid="ui-button"
            data-variant={variant}
            data-size={size}
            className={className}
            onClick={onClick}
            {...props}
        >
            {children}
        </button>
    ),
    buttonVariants: jest.fn((options: { variant?: string; size?: string; className?: string }) => {
        return `mock-button-class-${options?.variant || 'default'}-${options?.size || 'default'} ${options?.className || ''}`;
    })
}));

// Mock UI components - Input
jest.mock('@/components/ui/input', () => ({
    Input: ({ type = 'text', className, placeholder, onChange, value, ...props }: any) => (
        <input
            data-testid={`input-${type}`}
            type={type}
            className={className}
            placeholder={placeholder}
            onChange={onChange}
            value={value}
            {...props}
        />
    )
}));

// Mock UI components - Form
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

// Mock UI components - Toast
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

// Mock UI components - Dialog
jest.mock('@/components/ui/dialog', () => ({
    Dialog: ({ children, open }: any) =>
        open ? <div data-testid='dialog'>{children}</div> : null,
    DialogContent: ({ children }: any) => (
        <div data-testid='dialog-content'>{children}</div>
    ),
    DialogHeader: ({ children }: any) => (
        <div data-testid='dialog-header'>{children}</div>
    ),
    DialogTitle: ({ children }: any) => (
        <div data-testid='dialog-title'>{children}</div>
    ),
}));

// Mock Lucide icons
jest.mock('lucide-react', () => ({
    ArrowLeft: () => <div data-testid="arrow-left-icon">←</div>,
    ArrowUp: () => <div data-testid="arrow-up-icon">↑</div>,
    Loader: () => <div data-testid="lucide-loader">Loading Icon...</div>,
    PlusCircle: () => <div data-testid="plus-icon">+</div>,
    Search: () => <div data-testid="search-icon">🔍</div>
}));

// Mock Framer Motion
jest.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: any) => <div data-testid="motion-div" {...props}>{children}</div>,
        button: ({ children, ...props }: any) => <button data-testid="motion-button" {...props}>{children}</button>,
        img: ({ ...props }: any) => <img data-testid="motion-img" {...props} alt={props.alt || ''} />,
        h1: ({ children, ...props }: any) => <h1 data-testid="motion-h1" {...props}>{children}</h1>,
        p: ({ children, ...props }: any) => <p data-testid="motion-p" {...props}>{children}</p>,
        li: ({ children, ...props }: any) => <li {...props}>{children}</li>
    },
    AnimatePresence: ({ children }: any) => <>{children}</>
}));

// Mock React Hook Form
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