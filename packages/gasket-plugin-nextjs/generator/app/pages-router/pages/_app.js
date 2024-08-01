import React from 'react';
{{#if hasGasketIntl}}
{{/if}}
{{#if hasGasketRedux}}
import { nextRedux } from '../redux/store';
{{/if}}
{{#if hasGasketIntl}}
import { useRouter } from 'next/router';
import { IntlProvider } from 'react-intl';
import { withMessagesProvider } from '@gasket/react-intl';
import intlManager from '../intl.js';
{{/if}}

{{#if hasGasketIntl}}
const IntlMessagesProvider = withMessagesProvider(intlManager)(IntlProvider);
{{/if}}

// Simple functional App component which can be wrapped
// https://nextjs.org/docs/pages/building-your-application/routing/custom-app
function App({ Component, pageProps }) {
  {{#if hasGasketIntl}}
  const router = useRouter();
  {{/if}}

  return (
  {{#if hasGasketIntl}}
  <IntlMessagesProvider locale={router.locale}>
  {{/if}}
    <Component { ...pageProps } />
  {{#if hasGasketIntl}}
  </IntlMessagesProvider>
  {{/if}}
  );
}

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
  {{#if hasGasketRedux}}
  nextRedux.withRedux,
  {{/if}}
].reduce((cmp, hoc) => hoc(cmp), App);
