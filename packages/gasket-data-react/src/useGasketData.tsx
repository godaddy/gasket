import { useContext } from 'react';
import { GasketDataContext } from './GasketDataProvider';

export const useGasketData = <T extends unknown = Record<string, unknown>>() => {
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  return useContext<T>(GasketDataContext as any) || {} as T;
};
