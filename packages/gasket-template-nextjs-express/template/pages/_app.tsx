import React from 'react';
import { useRouter } from 'next/router';
import { IntlProvider } from 'react-intl';
import { withMessagesProvider } from '@gasket/react-intl';
import intlManager from '../intl';

const IntlMessagesProvider = withMessagesProvider(intlManager)(IntlProvider);

// Simple functional App component which can be wrapped
// https://nextjs.org/docs/pages/building-your-application/routing/custom-app
function App({ Component, pageProps }) {
  const router = useRouter();

  return (
    <IntlMessagesProvider locale={ router.locale }>
      <Component { ...pageProps } />
    </IntlMessagesProvider>
  );
}

// Wrap the app with higher-order components
export default App;
