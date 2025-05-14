'use client';

import hoistNonReactStatics from 'hoist-non-react-statics';
import htmlescape from 'htmlescape';
import { createElement, useState } from 'react';
import { GasketIntlContext, makeContext } from './context.js';

/** @type {import('./index.d.ts').withMessagesProvider} */
export function withMessagesProvider(
  intlManager,
  options
) {
  const { staticLocaleFilePaths } = options ?? {};

  return function wrapper(Component) {
    const displayName = Component.displayName || Component.name || 'Component';

    /** @type {import('./index.d.ts').IntlProviderHOC} */
    function HOC(props) {
      // TODO (PFX-689): explore a localeFileKey callback here which
      //  would be passed to the handler allowing tuning a localeFileKey
      //  based on outside conditions such as query params.
      const { locale, ...rest } = props;
      const localeHandler = intlManager.handleLocale(locale);

      // load any additional staticLocaleFilePaths
      if (staticLocaleFilePaths?.length > 0) {
        void localeHandler.loadStatics(...staticLocaleFilePaths);
      }

      const [messages, setMessages] = useState(localeHandler.getAllMessages());
      const contextValue = makeContext(localeHandler, messages, setMessages);

      return createElement(
        GasketIntlContext.Provider,
        { value: contextValue },
        createElement('script', {
          id: 'GasketIntl',
          type: 'application/json',
          dangerouslySetInnerHTML: {
            __html: htmlescape(localeHandler.getStaticsRegister())
          }
        }),
        createElement(Component, { ...rest, locale, messages })
      );
    }

    hoistNonReactStatics(HOC, Component);
    HOC.displayName = `withMessagesProvider(${displayName})`;
    HOC.WrappedComponent = Component;

    return HOC;
  };
}
