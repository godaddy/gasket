import React from 'react';
import { render, screen } from '@testing-library/react';
import IndexPage from '../app/page.js';
import { expect } from '@jest/globals';

describe('IndexPage', () => {
  it('renders page', () => {
    render(<IndexPage />);

    expect(screen.getByRole('heading').textContent).toBe('Welcome to Gasket!');
  });
});

