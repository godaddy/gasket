import React from 'react';
import { render, screen } from '@testing-library/react';
import { IndexPage } from '../pages/index';
import { expect } from '@jest/globals';

// Fix for noisy jsdom error
// https://github.com/nickcolley/jest-axe/issues/147#issuecomment-758804533
const { getComputedStyle } = window;
window.getComputedStyle = (elt) => getComputedStyle(elt);

jest.mock('react-intl');

describe('IndexPage', () => {
  it('renders page', () => {
    render(<IndexPage />);

    expect(screen.getByText('Welcome to Gasket!')).toBeTruthy();
  });
});
