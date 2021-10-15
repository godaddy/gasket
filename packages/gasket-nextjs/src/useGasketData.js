import { useContext } from 'react';
import { GasketDataContext } from './GasketDataProvider';


export const useGasketData = () => {
  return useContext(GasketDataContext) || {};
};
