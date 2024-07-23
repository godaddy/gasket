import React from 'react';

/** @type {import('.').GasketIntlContext} */
const defaultContext = {
  getStatus: () => 'not-loaded',
  load: () => {},
  messages: {}
};

export const GasketIntlContext = React.createContext(defaultContext);
