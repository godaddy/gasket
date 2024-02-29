import React from 'react';
import PropTypes from 'prop-types';
{{#if hasGasketIntl}}
import { withIntlProvider } from '@gasket/react-intl';
{{/if}}
{{#if hasGasketRedux}}
const { nextRedux } = require('../redux/store');
{{/if}}

// Simple functional App component which can be wrapped
// https://nextjs.org/docs/pages/building-your-application/routing/custom-app
function App({ Component, pageProps }) {
  return <Component { ...pageProps } />;
}

App.propTypes = {
  Component: PropTypes.elementType,
  pageProps: PropTypes.object
};

{{#if hasGasketRedux}}
// Make the store available to the Pages via getInitialProps
// https://github.com/kirill-konshin/next-redux-wrapper?tab=readme-ov-file#app
App.getInitialProps = nextRedux.getInitialAppProps(
  (store) => async (appContext) => {
    const { Component, ctx } = appContext;
    const pageProps = Component.getInitialProps ? await Component.getInitialProps({ ...ctx, store }) : {};
    return {
      pageProps
    };
  }
);
{{/if}}

// Wrap the app with higher-order components
export default [
  {{#if hasGasketIntl}}
  withIntlProvider(),
  {{/if}}
  {{#if hasGasketRedux}}
  nextRedux.withRedux,
  {{/if}}
].reduce((cmp, hoc) => hoc(cmp), App);
