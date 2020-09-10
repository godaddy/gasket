import React from 'react';
import PropTypes from 'prop-types';

// The store path is also available from `process.env.GASKET_MAKE_STORE_FILE`
const { nextRedux } = require('../redux/store');

// Simple functional App component which we can wrap with next-redux-wrapper
// @see: https://github.com/kirill-konshin/next-redux-wrapper#usage
function WrappedApp({ Component, pageProps }) {
  return <Component { ...pageProps } />;
}

WrappedApp.propTypes = {
  Component: PropTypes.elementType,
  pageProps: PropTypes.object
};

export default nextRedux.withRedux(WrappedApp);
