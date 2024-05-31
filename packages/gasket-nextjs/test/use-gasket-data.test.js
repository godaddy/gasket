import { jest, expect } from '@jest/globals';
import { createElement } from 'react';
import { render } from '@testing-library/react';
import { useGasketData } from '../lib/index.js';
import { GasketDataProvider } from '../lib/gasket-data-provider.js';

import { mockConsoleError } from './helpers.js';
mockConsoleError();

/**
 * need to use @testing-library to properly test hooks
 */
describe('useGasketData', function () {

  it('should return gasketData', async () => {
    const observeData = jest.fn();
    const testData = { greeting: 'hello' };

    const MockConsumer = () => {
      const { greeting } = useGasketData();

      return createElement('div', null, greeting);
    };

    const MockApp = () => (
      createElement(GasketDataProvider, { gasketData: testData },
        createElement(MockConsumer, { onGotData: observeData })
      )
    );

    const content = render(createElement(MockApp));

    expect(content.baseElement.textContent).toEqual(testData.greeting);
  });
});
