import { createElement, createContext } from 'react';
import PropTypes from 'prop-types';

export const GasketDataContext = createContext({});

/**
 * Provider for the GasketData, adds context to child elements.
 *
 * @type {import('.').GasketDataProvider} GasketDataProvider
 */
export const GasketDataProvider = ({ gasketData, children }) => {
  return createElement(GasketDataContext.Provider, { value: gasketData }, children);
};

GasketDataProvider.propTypes = {
  gasketData: PropTypes.object,
  children: PropTypes.node
};
