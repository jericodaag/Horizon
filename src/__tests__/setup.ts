import '@testing-library/jest-dom';

// Global mocks that would be repeated in multiple test files (to be continued..)
jest.mock('@/lib/utils', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

// Type declarations for jest-dom matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveTextContent: (text: string) => R;
      toBeInTheDocument: () => R;
      toHaveAttribute: (attr: string, value?: string) => R;
      toBeDisabled: () => R;
    }
  }
}
