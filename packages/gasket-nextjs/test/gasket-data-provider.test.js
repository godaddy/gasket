import React from 'react';
import assume from 'assume';
import { render, screen } from '@testing-library/react';

import { GasketDataProvider } from '../src/gasket-data-provider';

describe('GasketDataProvider', function () {

  it('should render the component', () => {
    render(<GasketDataProvider gasketData={{ test: 'test' }}>hello</GasketDataProvider>);
    assume(screen.getByText('hello')).exists();
  });
});
