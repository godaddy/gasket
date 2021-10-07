import { Context, useContext } from 'react';
import { GasketDataContext } from './GasketDataProvider';


export const useGasketData = <GD extends Record<string, unknown> = Record<string, unknown>>() => {
  return useContext<GD>(GasketDataContext as Context<GD>) || {} as GD;
};
