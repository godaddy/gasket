import React from 'react';
import { renderHook } from '@testing-library/react-hooks';
import assume from 'assume';
import { useGasketData } from '../src';
import { GasketDataProvider } from '../src/gasket-data-provider';

/**
 * need to use @testing-library to properly test hooks
 */
describe('useGasketData', function () {

  it('should return gasketData', async () => {
    const testData = { test: 'hello' };

    const { result } = renderHook(() => useGasketData(), {
      wrapper({ children }) {
        return <GasketDataProvider gasketData={ testData }>{children}</GasketDataProvider>;
      }
    });

    assume(result.current).eql(testData);
  });
});
