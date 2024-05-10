import { createElement, createContext } from 'react';
import PropTypes from 'prop-types';

export const GasketDataContext = createContext({});

/**
 * Provider for the GasketData, adds context to child elements.
 * @param {object} props - Props
 * @param {import('@gasket/data').GasketData} props.gasketData - Object of
 * GasketData
 * @param {ReactNode} props.children - Element to add GasketData context too
 * @returns {ReactElement} element
 */
export const GasketDataProvider = ({ gasketData, children }) => {
  return createElement(GasketDataContext.Provider, { value: gasketData }, children);
};

GasketDataProvider.propTypes = {
  gasketData: PropTypes.object,
  children: PropTypes.node
};
