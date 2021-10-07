import React from 'react';
import { withGasketDataProps } from 'withGasketData';

export const GasketDataContext = React.createContext<Record<string, unknown>>({});

export const GasketDataProvider = <GD extends Record<string, unknown>>({ gasketData, children }: withGasketDataProps<GD>) => {
  return (
    <GasketDataContext.Provider value={gasketData}>
      {children}
    </GasketDataContext.Provider>
  );
};
