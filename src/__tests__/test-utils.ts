import React, { ReactElement } from 'react';
import {
  render,
  RenderOptions,
  screen,
  fireEvent,
  waitFor,
} from '@testing-library/react';
import '@testing-library/jest-dom';

// Custom render function if we need to wrap components with providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  return render(ui, { ...options });
};

// Export everything
export { customRender as render, screen, fireEvent, waitFor };
