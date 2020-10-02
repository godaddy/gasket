import React, { useContext, useReducer } from 'react';
import PropTypes from 'prop-types';
import merge from 'lodash.merge';
import { IntlProvider } from 'react-intl';
import fetch from '@gasket/fetch';
import { isBrowser, defaultLocale, manifest, clientData } from './config';
import { LOADING, LOADED, ERROR, getLocalePath, pathToUrl } from './utils';

const GasketIntlContext = React.createContext({
  locale: defaultLocale,
  status: {}
});

function init(fromPage) {
  if (isBrowser) {
    // merge any data set on window with what comes from SSR or static page props
    const { messages = {}, status = {} } = clientData;
    return merge({}, { messages, status }, fromPage);
  }

  return fromPage;
}

function reducer(state, action) {
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
}

function getActiveLocale() {
  if (isBrowser) {
    return window.gasketIntlLocale ?? clientData.locale ?? navigator.languages[0];
  }
  return defaultLocale;
}

/**
 *
 * @param Component
 * @return {function(*=): *}
 */
export function withGasketIntl(Component) {
  function Wrapper(props = {}) {

    // Support for wrapping Next.js App with data from get server side and static props
    const { pageProps: { gasketIntl: fromPage } = {} } = props; // eslint-disable-line react/prop-types

    const [state, dispatch] = useReducer(reducer, fromPage || {}, init);

    // If we have incoming pageProps, we need to update state but have to by
    // mutation rather than issuing a dispatch to avoid re-renders and timing issues
    if (fromPage) {
      merge(state, fromPage);
    }

    const locale = fromPage?.locale || getActiveLocale();

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

  Wrapper.displayName = `withGasketIntl(${ Component.displayName || Component.name || 'Component' })`;
  if ('getInitialProps' in Component) {
    Wrapper.getInitialProps = Component.getInitialProps;
  }
  return Wrapper;
}

function useGasketIntl(localePath) {
  const { locale, status = {}, dispatch } = useContext(GasketIntlContext);

  // We cannot use dispatch from useReducer during SSR, so exit early.
  // If you want a locale file to be ready, preload it to gasketIntl data
  // or load with getStaticProps or getServerSideProps
  if (!isBrowser) return LOADING;

  const localeFile = getLocalePath(localePath, locale);

  const fileStatus = status[localeFile];
  if (fileStatus) return fileStatus;
  // Mutate status state. We don't need to dispatch here. Avoids an unnecessary render
  status[localeFile] = LOADING;

  const url = pathToUrl(localeFile);

  fetch(url)
    .then(r => r.ok ? r.json() : Promise.reject(new Error(`Error loading locale file (${ r.status }): ${ url }`)))
    .then(messages => {
      dispatch({
        type: LOADED,
        payload: {
          locale,
          messages,
          file: localeFile
        }
      });
    })
    .catch(e => {
      console.error(e); // eslint-disable-line no-console
      dispatch({
        type: ERROR,
        payload: {
          file: localeFile
        }
      });
    });

  return LOADING;
}

export function LocalesRequired(props) {
  const { localePath, loading = null, children } = props;
  const loadState = useGasketIntl(localePath);
  if (loadState === LOADING) return loading;
  return <>{ children }</>;
}

LocalesRequired.propTypes = {
  localePath: PropTypes.string,
  loading: PropTypes.node,
  children: PropTypes.node.isRequired
};

LocalesRequired.defaultProps = {
  localePath: manifest.defaultPath
};

export const withLocalesRequired = (localePath = manifest.defaultPath, options = {}) => {
  const { loading = null } = options;
  return Component => {
    function Wrapper(props) {
      const loadState = useGasketIntl(localePath);
      if (loadState === LOADING) return loading;
      return <Component { ...props } />;
    }

    Wrapper.displayName = `withLocalesRequired(${ Component.displayName || Component.name || 'Component' })`;
    return Wrapper;
  };
};
