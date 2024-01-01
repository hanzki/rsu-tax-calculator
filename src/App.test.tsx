import { expect, test } from 'vitest'
import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test.skip('renders page title', () => {
  render(<App />);
  const titleElement = screen.getByText(/RSU Tax Calculator/i);
  expect(titleElement).toBeInTheDocument();
});
