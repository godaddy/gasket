import { expect } from '@jest/globals';
import { createElement } from 'react';
import { render, screen } from '@testing-library/react';
import { GasketDataProvider } from '../lib/gasket-data-provider.js';

import { mockConsoleError } from './helpers.js';
mockConsoleError();


describe('GasketDataProvider', function () {
  it('should render the component', () => {
    render(createElement(GasketDataProvider, { gasketData: { test: 'test' } }, 'hello'));
    expect(screen.getByText('hello')).toBeDefined();
  });
});
