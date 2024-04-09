import React from 'react';
import PropTypes from 'prop-types';

export const GasketDataContext = React.createContext({});

/**
 * Provider for the GasketData, adds context to child elements.
 * @param {object} props - Props
 * @param {import('@gasket/data').GasketData} props.gasketData - Object of
 * GasketData
 * @param {JSX.Element} props.children - Element to add GasketData context too
 * @returns {JSX.Element} element
 */
export const GasketDataProvider = ({ gasketData, children }) => {
  return (
    <GasketDataContext.Provider value={ gasketData }>
      {children}
    </GasketDataContext.Provider>
  );
};

GasketDataProvider.propTypes = {
  gasketData: PropTypes.object,
  children: PropTypes.node
};
