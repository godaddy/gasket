import React from 'react';
import PropTypes from 'prop-types';

export const GasketDataContext = React.createContext({});

/**
 * Provider for the GasketData, adds context to child elements.
 *
 * @param {GasketData} props - Props
 * @param {GasketData} props.gasketData - Object of GasketData
 * @param {JSX.Element} props.children - Element to add GasketData context too
 * @returns {function} wrapper
 */
export const GasketDataProvider = ({ gasketData, children }) => {
  return (
    <GasketDataContext.Provider value={ gasketData }>
      { children }
    </GasketDataContext.Provider>
  );
};

GasketDataProvider.propTypes = {
  gasketData: PropTypes.object,
  children: PropTypes.node
};

