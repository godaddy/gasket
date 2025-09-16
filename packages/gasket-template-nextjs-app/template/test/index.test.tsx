import React from 'react';
import { render, screen } from '@testing-library/react';
import IndexPage from '../app/page.tsx';
import { expect, describe, it } from 'vitest';

describe('IndexPage', () => {
  it('renders page', () => {
    render(<IndexPage />);

    expect(screen.getByRole('heading').textContent).toBe('Welcome to Gasket!');
  });
});
