import React, { useReducer } from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';
import merge from 'lodash.merge';
import { IntlProvider } from 'react-intl';
import { GasketIntlContext } from './context';
import { clientData, isBrowser } from './config';
import { getActiveLocale, LocaleStatus } from './utils';

/**
 * Merges any initial state from render with that from page props
 *
 * @param {LocalesProps|{}} localesProps - Initial props from a Next.js page
 * @returns {LocalesState} state
 */
export function init(localesProps) {
  const { messages = {}, status = {} } = localesProps;
  if (isBrowser) {
    // merge any data set on window with what comes from SSR or static page props
    const { messages: dataMessages = {}, status: dataStatus = {} } = clientData;
    return merge({}, { messages: dataMessages, status: dataStatus }, { messages, status });
  }

  return { messages, status };
}

/**
 *
 * @param {LocalesState} state - Incoming state
 * @param {{type: string, payload: {}}} action - State change action
 * @returns {LocalesState} state result
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
 * Make an HOC that adds a provider to managing locale files as well as the react-intl Provider.
 * This can be used to wrap a top level React or a Next.js custom App component.
 *
 * @returns {function} wrapper
 */
export default function withIntlProvider() {
  /**
   * Wrap the component
   * @param {React.Component} Component - Component to wrap
   * @returns {React.Component} wrapped component
   */
  return Component => {
    /**
     * Wrapper component which sets up providers and reducer hook
     *
     * @param {object} props - Component props
     * @param {object} [props.pageProps] - Component props from a Next.js page
     * @param {LocalesProps} [props.pageProps.localesProps] - Initial state from a Next.js page
     * @returns {JSX.Element} element
     */
    function Wrapper(props = {}) {

      // Support for wrapping Next.js App with data from get server side and static props
      const { pageProps: { localesProps } = {} } = props; // eslint-disable-line react/prop-types

      const [state, dispatch] = useReducer(reducer, localesProps || {}, init);

      // If we have incoming pageProps, we need to update state but have to by
      // mutation rather than issuing a dispatch to avoid re-renders and timing issues
      if (localesProps) {
        merge(state, localesProps);
      }

      const locale = localesProps?.locale ||
        // Support for Next.js i18n routing
        props.router?.locale || // eslint-disable-line react/prop-types
        getActiveLocale();

      const { status } = state;
      const messages = (state.messages || {})[locale];
      const contextValue = { locale, status, dispatch };

      return (
        <GasketIntlContext.Provider value={ contextValue }>
          <IntlProvider locale={ locale } key={ locale } messages={ messages } initialNow={ Date.now() }>
            <Component { ...props } />
          </IntlProvider>
        </GasketIntlContext.Provider>
      );
    }

    Wrapper.displayName = `withIntlProvider(${ Component.displayName || Component.name || 'Component' })`;
    hoistNonReactStatics(Wrapper, Component);
    return Wrapper;
  };
}
