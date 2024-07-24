import React from 'react';
import PropTypes from 'prop-types';
import gasket from '../gasket.js';
import { withGasketData } from '@gasket/nextjs/layout'

function RootLayout({ children }) {
  return (
    <html lang='en'>
      <body>{children}</body>
    </html>
  );
}

export default withGasketData(gasket)(RootLayout);

RootLayout.propTypes = {
  children: PropTypes.node
};
