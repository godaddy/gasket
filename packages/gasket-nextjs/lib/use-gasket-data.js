import { useContext } from 'react';
import { GasketDataContext } from './gasket-data-provider';

/**
 * React that fetches GasketData in elements context and returns it
 * @returns {object} GasketData
 */
export const useGasketData = () => {
  return useContext(GasketDataContext) || {};
};
