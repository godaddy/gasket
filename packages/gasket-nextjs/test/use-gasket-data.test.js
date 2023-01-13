import React from 'react';
import { render } from '@testing-library/react';
import assume from 'assume';
import { spy } from 'sinon';
import { useGasketData } from '../src';
import { GasketDataProvider } from '../src/gasket-data-provider';

/**
 * need to use @testing-library to properly test hooks
 */
describe('useGasketData', function () {

  it('should return gasketData', async () => {
    const observeData = spy();
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

    assume(content.baseElement.textContent).equals(testData.greeting);
  });
});
