// src/__tests__/setup.ts
import '@testing-library/jest-dom';
import React from 'react';
import { mockNavigate } from './test-utils';

// Global mocks that would be repeated in multiple test files
jest.mock('@/lib/utils', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

// Mock React Router DOM - this is crucial
jest.mock('react-router-dom', () => ({
  // For AuthLayout test
  Outlet: () =>
    React.createElement(
      'div',
      { 'data-testid': 'outlet-mock' },
      'Outlet Content'
    ),

  // For navigation in components
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/sign-in' }),
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) =>
      React.createElement('div', props, children),
    h1: ({ children, ...props }: any) =>
      React.createElement('h1', props, children),
    h2: ({ children, ...props }: any) =>
      React.createElement('h2', props, children),
    p: ({ children, ...props }: any) =>
      React.createElement('p', props, children),
    button: ({ children, ...props }: any) =>
      React.createElement('button', props, children),
    img: ({ ...props }: any) =>
      React.createElement('img', {
        ...props,
        alt: props.alt || 'mocked-image',
      }),
  },
  AnimatePresence: ({ children }: any) =>
    React.createElement(React.Fragment, null, children),
}));

// Mock API queries
jest.mock('@/lib/react-query/queries', () => ({
  useSignInAccount: () => ({
    mutateAsync: jest.fn().mockResolvedValue({ user: true }),
    isPending: false,
  }),
  useCreateUserAccount: () => ({
    mutateAsync: jest.fn().mockResolvedValue({ user: { id: 'user123' } }),
    isPending: false,
  }),
  useGetRecentPosts: () => ({
    data: {
      documents: [
        {
          $id: '1',
          caption: 'Beautiful sunset',
          imageUrl: '/image1.jpg',
          creator: { name: 'John Doe' },
        },
        {
          $id: '2',
          caption: 'City skyline',
          imageUrl: '/image2.jpg',
          creator: { name: 'Jane Smith' },
        },
      ],
    },
  }),
}));

// Mock context
jest.mock('@/context/AuthContext', () => ({
  useUserContext: () => ({
    checkAuthUser: jest.fn().mockResolvedValue(true),
    isLoading: false,
  }),
}));

// Mock toast
jest.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

// Mock form components
jest.mock('@/components/ui/form', () => ({
  Form: ({ children, ...props }: any) =>
    React.createElement('form', props, children),
  FormField: ({ render }: any) => {
    const field = {
      value: '',
      onChange: jest.fn(),
      onBlur: jest.fn(),
      ref: jest.fn(),
      name: 'test',
    };
    return render({ field });
  },
  FormItem: ({ children }: any) => React.createElement('div', null, children),
  FormLabel: ({ children }: any) =>
    React.createElement('label', null, children),
  FormControl: ({ children }: any) =>
    React.createElement('div', null, children),
  FormMessage: () =>
    React.createElement('span', { 'data-testid': 'form-error' }),
}));

// Mock input
jest.mock('@/components/ui/input', () => ({
  Input: ({ type, ...props }: any) =>
    React.createElement('input', {
      type,
      'data-testid': `input-${type}`,
      ...props,
    }),
}));

// Mock button
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: any) =>
    React.createElement('button', props, children),
}));

// Mock form libraries
jest.mock('@hookform/resolvers/zod', () => ({
  zodResolver: jest.fn(() => jest.fn()),
}));

jest.mock('react-hook-form', () => ({
  useForm: () => ({
    handleSubmit: (callback: any) => (e: any) => {
      e?.preventDefault?.();
      return callback({ email: 'test@example.com', password: 'password123' });
    },
    control: {},
    formState: { errors: {} },
    reset: jest.fn(),
  }),
}));

// Extend Jest matchers with testing-library
declare global {
  namespace jest {
    interface Matchers<R = void, T = {}> {
      toBeInTheDocument(): R;
      toHaveTextContent(text: string | RegExp): R;
      toHaveAttribute(attr: string, value?: string): R;
      toBeDisabled(): R;
      toBeEnabled(): R;
      toBeVisible(): R;
      toBeChecked(): R;
      toBePartiallyChecked(): R;
      toHaveValue(value?: string | string[] | number | null): R;
      toHaveStyle(css: string | object): R;
      toHaveClass(...classNames: string[]): R;
      toHaveFocus(): R;
      toBeEmpty(): R;
      toBeRequired(): R;
      toBeValid(): R;
      toBeInvalid(): R;
      toContainElement(element: HTMLElement | null): R;
      toContainHTML(htmlText: string): R;
    }
  }
}
