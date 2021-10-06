import React from 'react';

type Props = {
    data: Record<string, unknown>,
    children: React.ReactNode
}

export const GasketDataContext = React.createContext<Record<string, unknown>>({});

export const GasketDataProvider = ({ data, children }: Props) => {
  return (
    <GasketDataContext.Provider value={data}>
      {children}
    </GasketDataContext.Provider>
  );
};
