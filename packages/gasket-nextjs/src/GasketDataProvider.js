import React from 'react';
import PropTypes from 'prop-types';

export const GasketDataContext = React.createContext({});

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

