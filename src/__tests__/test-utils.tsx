import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';

// Create a Router mock wrapper
export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <div data-testid='router-provider'>{children}</div>;
};

// Mock navigation function that tests can access
export const mockNavigate = jest.fn();

// Custom render function that includes providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  return render(ui, {
    wrapper: ({ children }) => <RouterProvider>{children}</RouterProvider>,
    ...options,
  });
};

// Re-export everything from testing-library
export * from '@testing-library/react';

// Override render method
export { customRender as render };
