import React from 'react'; // ✅ Add this
import { render, screen } from '@testing-library/react';
import { test, expect } from 'vitest';
import App from '../App';

test('renders app component', () => {
  render(<App />);
  expect(screen.getByText(/blog posts/i)).toBeInTheDocument();
});


