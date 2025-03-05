import React from 'react';
import { render, RenderOptions } from '@testing-library/react';

// Custom render function
const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, options);

// Export everything from testing-library
export * from '@testing-library/react';

// Export custom render
export { customRender as render };