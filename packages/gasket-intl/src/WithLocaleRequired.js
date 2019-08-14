import React from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';
import LocaleRequired from './LocaleRequired';
import { loadLocaleFilesIntoStore } from './ServerUtils';
import localeApi from './LocaleApi';
import { getParamsForIdentifiers } from './Utils';

const withLocaleRequired = (identifier, props) => {

  return Component => {
    const Wrapper = ownProps => {
      return (
        <LocaleRequired identifier={ identifier } { ...props }>
          <Component { ...ownProps } />
        </LocaleRequired>
      );
    };

    hoistNonReactStatics(Wrapper, Component);
    Wrapper.displayName = `withLocaleRequired(${Component.displayName || Component.name || 'Component'})`;

    Wrapper.getInitialProps = async (ctx) => {
      const { isServer, store, req } = ctx;

      if (isServer) {
        const { localesDir, originalUrl } = req;
        if (localesDir) {
          await loadLocaleFilesIntoStore(store, identifier, localesDir);
        } else {
          // eslint-disable-next-line no-console
          console.error(`withLocaleRequired: localesDir undefined for ${originalUrl}`);
        }
      } else {
        const state = store.getState();
        const moduleParams = getParamsForIdentifiers(state, identifier);
        const _messages = moduleParams.map(params => localeApi.selectors.getMessages(state, params));
        await Promise.all(moduleParams.map(async (params, idx) => {
          if (!_messages[idx] || !_messages[idx].isLoaded) {
            await store.dispatch(localeApi.actionCreators.getMessages(params));
          }
        }));
      }

      return {
        ...(Component.getInitialProps ? await Component.getInitialProps(ctx) : {})
      };
    };

    Wrapper.WrappedComponent = Component;
    return Wrapper;
  };
};

export default withLocaleRequired;
