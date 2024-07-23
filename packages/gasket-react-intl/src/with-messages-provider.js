import hoistNonReactStatics from 'hoist-non-react-statics';
import htmlescape from 'htmlescape';
import { createElement, useState } from 'react';
import { GasketIntlContext } from './context.js';
import { needsToLoad } from './utils.js';

// TODO: test this
function makeContext(localeHandler, messages, setMessages) {

  /** @type {import('.').IntlContextLoad} */
  function load(...localeFilePaths) {
    const status = localeHandler.getStatus(...localeFilePaths);

    if (needsToLoad(status)) {
      void localeHandler.load(...localeFilePaths).then(() => {
        setMessages(localeHandler.getAllMessages());
      });
    }
  }

  /** @type {import('.').IntlContextStatus} */
  function getStatus(...localeFilePaths) {
    return localeHandler.getStatus(...localeFilePaths);
  }

  return {
    getStatus,
    load,
    messages
  };
}

/** @type {import('.').withMessagesProvider} */
export function withMessagesProvider(
  intlManager,
  options
) {
  const { statics = [intlManager.defaultLocaleFilePath] } = options ?? {};

  return function wrapper(Component) {
    const displayName = Component.displayName || Component.name || 'Component';

    /** @type {import('.').IntlProviderHOC} */
    function HOC(props) {
      // TODO (PFX-689): explore a localeFileKey callback here which
      //  would be passed to the handler allowing tuning a localeFileKey
      //  based on outside conditions such as query params.
      // eslint-disable-next-line react/prop-types
      const { locale, ...rest } = props;
      const localeHandler = intlManager.handleLocale(locale);

      if (
        statics?.length > 0) {
        void localeHandler.loadStatics(...statics);
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
