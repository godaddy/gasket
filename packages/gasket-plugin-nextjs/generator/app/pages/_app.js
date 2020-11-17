import React from 'react';
import PropTypes from 'prop-types';
{{#if hasGasketIntl}}
import { withIntlProvider } from '@gasket/intl';
{{/if}}
{{#if hasGasketRedux}}
const { nextRedux } = require('../redux/store');
{{/if}}

// Simple functional App component which can be wrapped
function WrappedApp({ Component, pageProps }) {
  return <Component { ...pageProps } />;
}

WrappedApp.propTypes = {
  Component: PropTypes.elementType,
  pageProps: PropTypes.object
};

// wrap the app with higher-order components
export default [
  {{#if hasGasketIntl}}
  withIntlProvider(),
  {{/if}}
  {{#if hasGasketRedux}}
  nextRedux.withRedux,
  {{/if}}
].reduce((cmp, hoc) => hoc(cmp), WrappedApp);
