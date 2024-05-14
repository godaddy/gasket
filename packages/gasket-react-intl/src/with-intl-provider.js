import { useReducer, createElement } from 'react';
import PropTypes from 'prop-types';
import hoistNonReactStatics from 'hoist-non-react-statics';
import extend from 'just-extend';
import { IntlProvider } from 'react-intl';
import { GasketIntlContext } from './context';
import { clientData, isBrowser } from './config';
import { getActiveLocale, LocaleStatus } from './utils';

/**
 * Merges any initial state from render with that from page props
 * @type {import('./index').init}
 */
export function init(localesProps) {
  const { messages = {}, status } = localesProps;

  if (isBrowser) {
    // merge any data set on window with what comes from SSR or static page
    // props
    const { messages: dataMessages = {}, status: dataStatus = {} } = clientData;
    // @ts-ignore
    return extend(
      true,
      {},
      { messages: dataMessages, status: dataStatus },
      { messages, status }
    );
  }

  return { messages, status };
}

/**
 * Reducer for managing locale file loading status and messages
 * @type {import('./index').reducer}
 */
export function reducer(state, action) {
  const { type } = action;
  const { locale, messages, file } = action.payload;

  if (type === LocaleStatus.LOADED) {
    return {
      ...state,
      messages: {
        ...state.messages,
        [locale]: {
          ...state.messages[locale],
          ...messages
        }
      },
      status: {
        ...state.status,
        [file]: LocaleStatus.LOADED
      }
    };
  }

  return {
    ...state,
    status: {
      ...state.status,
      [file]: type
    }
  };
}

/**
 * Make an HOC that adds a provider to managing locale files as well as the
 * react-intl Provider. This can be used to wrap a top level React or a Next.js
 * custom App component.
 * @type {import('./index').withIntlProvider}
 */
export default function withIntlProvider() {
  return (Component) => {
    /**
     * @type {import('./index').IntlProviderWrapper}
     */
    function Wrapper(props) {
      // Support for wrapping Next.js App with data from get server side and
      // static props
      const { pageProps: { localesProps } = {} } = props;

      const [state, dispatch] = useReducer(reducer, localesProps || {}, init);

      // If we have incoming pageProps, we need to update state but have to by
      // mutation rather than issuing a dispatch to avoid re-renders and timing
      // issues
      if (localesProps) {
        extend(true, state, localesProps);
      }

      const locale = localesProps?.locale || getActiveLocale();

      /** @type {import('./index').LocaleStatus} */
      // @ts-ignore - the extend() mutation causes types issues
      const { status } = state;
      const messages = (state.messages || {})[locale];

      /** @type {import('./index').GasketIntlContext} */
      const contextValue = { locale, status, dispatch };

      return createElement(
        GasketIntlContext.Provider,
        { value: contextValue },
        createElement(
          IntlProvider,
          {
            locale,
            key: locale,
            messages
          },
          // @ts-ignore
          createElement(Component, props)
        )
      );
    }

    Wrapper.displayName = `withIntlProvider(${
      Component.displayName || Component.name || 'Component'
    })`;

    Wrapper.propTypes = {
      pageProps: PropTypes.object
    };

    hoistNonReactStatics(Wrapper, Component);

    return Wrapper;
  };
}
