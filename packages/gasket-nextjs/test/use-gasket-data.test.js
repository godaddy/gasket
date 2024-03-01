import React from 'react';
import { render } from '@testing-library/react';
import { useGasketData } from '../src';
import { GasketDataProvider } from '../src/gasket-data-provider';

/**
 * need to use @testing-library to properly test hooks
 */
describe('useGasketData', function () {

  it('should return gasketData', async () => {
    const observeData = jest.fn();
    const testData = { greeting: 'hello' };

    const MockConsumer = () => {
      const { greeting } = useGasketData();

      return <div>{ greeting }</div>;
    };

    const MockApp = () => (
      <GasketDataProvider gasketData={ testData }>
        <MockConsumer onGotData={ observeData }/>
      </GasketDataProvider>
    );

    const content = render(<MockApp/>);

    expect(content.baseElement.textContent).toEqual(testData.greeting);
  });
});
