import React, { useContext, useReducer } from 'react';
import { IntlProvider } from 'react-intl';
import merge from 'lodash.merge';
import fetch from '@gasket/fetch';

const LOADING = 'loading';
const LOADED = 'loaded';
const ERROR = 'error';

// TODO: needs to come from gasket.config.js
const defaultGasketIntl = {
  locale: 'en-US'
};

const GasketIntlContext = React.createContext({
  locale: defaultGasketIntl.locale,
  files: {}
});

function init(fromPage) {
  if (typeof window !== 'undefined') {
    // merge any defaults set on window with what comes from SSR or static props
    const clientState = window.gasketIntl || { messages: {}, files: {} };
    return merge({}, clientState, fromPage);
  }

  return fromPage;
}

function reducer(state, action) {
  const { locale, messages, files } = action.payload;
  switch (action.type) {
    case LOADED:
      return {
        ...state,
        messages: {
          ...state.messages,
          [locale]: {
            ...state.messages[locale],
            ...messages
          }
        },
        files: {
          ...state.files,
          ...files.reduce((a, c) => ({ ...a, [c]: LOADED }), {})
        }
      };
    case LOADING:
      return {
        ...state,
        files: {
          ...state.files,
          ...files.reduce((a, c) => ({ ...a, [c]: LOADING }), {})
        }
      };
    case ERROR:
      return {
        ...state,
        files: {
          ...state.files,
          ...files.reduce((a, c) => ({ ...a, [c]: ERROR }), {})
        }
      };
    default:
      throw new Error();
  }
}

// TODO: need support for locale map, manifest, and fallback
function getActiveLocale(fromPage = {}) {
  const { locale } = fromPage;
  if (locale) return locale;
  if (typeof window !== 'undefined') {
    // TODO: support for walking navigator.languages
    return window.gasketIntl?.locale ?? navigator.languages[0];
  }
  return defaultGasketIntl.locale;
}

export function withGasketIntl(App) {
  // eslint-disable-next-line react/prop-types
  function Wrapper({ Component, pageProps = {} }) {
    const { gasketIntl } = pageProps;
    const [state, dispatch] = useReducer(reducer, gasketIntl || {}, init);

    // if we have incoming pageProps, we need to update state but have to by
    // mutation rather than issuing a dispatch to avoid re-renders and timing issues
    if (gasketIntl) {
      merge(state, gasketIntl);
    }

    const locale = getActiveLocale(gasketIntl);

    const { files } = state;
    const messages = (state.messages || {})[locale];
    const contextValue = { locale, files, dispatch };

    return (
      <GasketIntlContext.Provider value={ contextValue }>
        <IntlProvider locale={ locale } key={ locale } messages={ messages } initialNow={ Date.now() }>
          <Component { ...pageProps } />;
        </IntlProvider>
      </GasketIntlContext.Provider>
    );
  }

  Wrapper.displayName = `withGasketIntl(${ App.displayName || App.name || 'App' })`;
  if ('getInitialProps' in App) {
    Wrapper.getInitialProps = App.getInitialProps;
  }
  return Wrapper;
}

// TODO: support for multiple locale files
function useGasketIntl(localePath) {
  const { locale, files = {}, dispatch } = useContext(GasketIntlContext);

  // We cannot use dispatch from useReducer during SSR, so exit early.
  // If you want a locale file to be ready, preload it to gasketIntl data
  // or load with getStaticProps or getServerSideProps
  if (typeof window === 'undefined') return LOADING;

  // TODO: move to fn to get locale file name
  const localeFile = `${ localePath }/${ locale }.json`;

  const fileState = files[localeFile];
  if (fileState) return fileState;

  dispatch({
    type: LOADING,
    payload: {
      files: [localeFile]
    }
  });

  fetch(localeFile)
    .then(r => r.ok ? r.json() : throw new Error(`Error loading locale file (${ r.status }): ${ localeFile }`))
    .then(messages => {
      dispatch({
        type: LOADED,
        payload: {
          locale,
          messages,
          files: [localeFile]
        }
      });
    })
    .catch(e => {
      // eslint-disable-next-line no-console
      console.error(e);
      dispatch({
        type: ERROR,
        payload: {
          files: [localeFile]
        }
      });
    });

  return LOADING;
}

export const withLocalesRequired = (localePath = '/locales') => {
  return Component => {
    function Wrapper(props) {
      const loadState = useGasketIntl(localePath);
      // TODO: Support for custom loading component
      if (loadState === LOADING) return null;
      return <Component { ...props } />;
    }

    Wrapper.displayName = `withLocalesRequired(${ Component.displayName || Component.name || 'Component' })`;
    return Wrapper;
  };
};
