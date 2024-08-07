import React, { ComponentType } from 'react';
import type { MessagesProps } from '@gasket/react-intl';

{{#if hasGasketIntl}}
import { useRouter } from 'next/router';
import { IntlProvider } from 'react-intl';
import { withMessagesProvider } from '@gasket/react-intl';
import intlManager from '../intl';
{{/if}}

{{#if hasGasketIntl}}
const IntlMessagesProvider = withMessagesProvider(intlManager)(IntlProvider as ComponentType<MessagesProps>);
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

// Wrap the app with higher-order components
export default App;
