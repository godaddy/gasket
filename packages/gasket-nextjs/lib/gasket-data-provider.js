import { createElement, createContext } from 'react';

export const GasketDataContext = createContext({});

/**
 * Provider for the GasketData, adds context to child elements.
 *
 * @type {import('.').GasketDataProvider} GasketDataProvider
 */
export const GasketDataProvider = ({ gasketData, children }) => {
  return createElement(GasketDataContext.Provider, { value: gasketData }, children);
};
