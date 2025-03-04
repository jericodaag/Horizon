import '@testing-library/jest-dom';

// Global mocks that would be repeated in multiple test files
jest.mock('@/lib/utils', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

// Extend Jest matchers with testing-library
declare global {
  namespace jest {
    interface Matchers<R> {
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
