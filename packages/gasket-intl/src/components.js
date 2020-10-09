import React, { useContext, useReducer } from 'react';
import PropTypes from 'prop-types';
import merge from 'lodash.merge';
import { IntlProvider } from 'react-intl';
import fetch from '@gasket/fetch';
import { isBrowser, manifest, clientData } from './config';
import { LOADING, LOADED, ERROR, localeUtils } from './utils';

/**
 * State of loaded locale files
 *
 * @typedef {object} LocalesState
 * @property {{string: string}} messages
 * @property {{LocalePath: LocalePathStatus}} status
 */

/**
 * Props for a Next.js page containing locale and initial state
 *
 * @typedef {LocalesState} LocalesProps
 * @property {Locale} locale
 */

const GasketIntlContext = React.createContext({
  locale: manifest.defaultLocale,
  status: {}
});

export const helpers = {};

/**
 * Merges any initial state from render with that from page props
 *
 * @param {LocalesProps|{}} localesProps - Initial props from a Next.js page
 * @returns {LocalesState} state
 */
helpers.init = function init(localesProps) {
  if (isBrowser) {
    // merge any data set on window with what comes from SSR or static page props
    const { messages = {}, status = {} } = clientData;
    return merge({}, { messages, status }, localesProps);
  }

  const { messages, status } = localesProps;
  return { messages, status };
};

/**
 *
 * @param {LocalesState} state - Incoming state
 * @param {{type: string, payload: {}}} action - State change action
 * @returns {LocalesState} state result
 */
helpers.reducer = function reducer(state, action) {
  const { type } = action;
  const { locale, messages, file } = action.payload;
  if (type === LOADED) {
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
        [file]: LOADED
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
};

/**
 * Determines the active locale from either what was rendered for the page (preferred),
 * or what is set in navigator.languages for the browser.
 * @see: https://developer.mozilla.org/en-US/docs/Web/API/NavigatorLanguage/languages#Browser_compatibility
 *
 * @returns {Locale} locale
 */
helpers.getActiveLocale = function getActiveLocale() {
  if (isBrowser) {
    return window.gasketIntlLocale ?? clientData.locale ?? navigator.languages[0];
  }
  return manifest.defaultLocale;
};

/**
 * React that fetches a locale file and returns loading status
 *
 * @param {LocalePathPart} localePathPart - Path containing locale files
 * @returns {LocalePathStatus} status
 */
helpers.useGasketIntl = function useGasketIntl(localePathPart) {
  const { locale, status = {}, dispatch } = useContext(GasketIntlContext);

  // We cannot use dispatch from useReducer during SSR, so exit early.
  // If you want a locale file to be ready, preload it to gasketIntl data
  // or load with getStaticProps or getServerSideProps.
  if (!isBrowser) return LOADING;

  const localePath = localeUtils.getLocalePath(localePathPart, locale);

  const fileStatus = status[localePath];
  if (fileStatus) return fileStatus;
  // Mutating status state to avoids an unnecessary render with using dispatch.
  status[localePath] = LOADING;

  const url = localeUtils.pathToUrl(localePath);

  // Upon fetching, we will dispatch file status and messages to kick off a render.
  fetch(url)
    .then(r => r.ok ? r.json() : Promise.reject(new Error(`Error loading locale file (${ r.status }): ${ url }`)))
    .then(messages => {
      dispatch({
        type: LOADED,
        payload: {
          locale,
          messages,
          file: localePath
        }
      });
    })
    .catch(e => {
      console.error(e); // eslint-disable-line no-console
      dispatch({
        type: ERROR,
        payload: {
          file: localePath
        }
      });
    });

  return LOADING;
};

/**
 * Make an HOC that adds a provider to managing locale files as well as the react-intl Provider.
 * This can be used to wrap a top level React or a Next.js custom App component.
 *
 * @returns {function} wrapper
 */
export function withIntlProvider() {
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

      const [state, dispatch] = useReducer(helpers.reducer, localesProps || {}, helpers.init);

      // If we have incoming pageProps, we need to update state but have to by
      // mutation rather than issuing a dispatch to avoid re-renders and timing issues
      if (localesProps) {
        merge(state, localesProps);
      }

      const locale = localesProps?.locale || helpers.getActiveLocale();

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
    if ('getInitialProps' in Component) {
      Wrapper.getInitialProps = Component.getInitialProps;
    }
    return Wrapper;
  };
}

/**
 * Component that loads a locale file before rendering children
 *
 * @param {object} props - Props
 * @param {LocalePathPart} props.localesPath - Path containing locale files
 * @param {React.Component} [props.loading] - Custom component to show while loading
 * @returns {JSX.Element|null} element
 */
export function LocaleRequired(props) {
  const { localesPath, loading = null, children } = props;
  const loadState = helpers.useGasketIntl(localesPath);
  if (loadState === LOADING) return loading;
  return <>{ children }</>;
}

LocaleRequired.propTypes = {
  localesPath: PropTypes.string,
  loading: PropTypes.node,
  children: PropTypes.node.isRequired
};

LocaleRequired.defaultProps = {
  localesPath: manifest.localesPath
};

/**
 * Make an HOC that loads a locale file before rendering wrapped component
 *
 * @param {LocalePathPart} localesPath - Path containing locale files
 * @param {object} [options] - Options
 * @param {React.Component} [options.loading] - Custom component to show while loading
 * @returns {function} wrapper
 */
export function withLocaleRequired(localesPath = manifest.localesPath, options = {}) {
  const { loading = null } = options;
  /**
   * Wrap the component
   * @param {React.Component} Component - Component to wrap
   * @returns {React.Component} wrapped component
   */
  return Component => {
    /**
     * Wrapper component that returns based on locale file status
     *
     * @param {object} props - Component props
     * @returns {JSX.Element} element
     */
    function Wrapper(props) {
      const loadState = helpers.useGasketIntl(localesPath);
      if (loadState === LOADING) return loading;
      return <Component { ...props } />;
    }

    Wrapper.displayName = `withLocaleRequired(${ Component.displayName || Component.name || 'Component' })`;
    return Wrapper;
  };
}
