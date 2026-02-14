import React from 'react';
import { useRouter } from 'next/router';
import { IntlProvider } from 'react-intl';
import { withMessagesProvider } from '@gasket/react-intl';
import intlManager from '../intl';

const IntlMessagesProvider = withMessagesProvider(intlManager)(IntlProvider);

/**
 * Simple functional App component which can be wrapped
 * @see https://nextjs.org/docs/pages/building-your-application/routing/custom-app
 * @param {object} props - Component props
 * @param {React.ComponentType} props.Component - Page component
 * @param {object} props.pageProps - Page props
 * @returns {React.ReactElement} App component
 */
function App({ Component, pageProps }: { Component: React.ComponentType; pageProps: object; }): React.ReactElement {
  const router = useRouter();
  const locale = router.locale ?? 'en-US';

  return (
    <IntlMessagesProvider locale={ locale }>
      <Component { ...pageProps } />
    </IntlMessagesProvider>
  );
}

// Wrap the app with higher-order components
export default App;
