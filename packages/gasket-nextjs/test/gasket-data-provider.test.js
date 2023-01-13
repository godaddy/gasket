import React from 'react';
import { render } from '@testing-library/react';
import assume from 'assume';
import { GasketDataProvider } from '../src/gasket-data-provider';

describe('GasketDataProvider', function () {

  it('should render the component', () => {
    const container = render(
      <GasketDataProvider gasketData={{ test: 'test' }}>hello</GasketDataProvider>
    );

    assume(container).exists();
    assume(container.baseElement.textContent).equals('hello');
  });
});
