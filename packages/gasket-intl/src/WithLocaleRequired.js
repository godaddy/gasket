import React from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';
import LocaleRequired from './LocaleRequired';
import { loadLocaleFilesToStore } from './ServerUtils';
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
    Wrapper.WrappedComponent = Component;
    return Wrapper;
  };
};

export default withLocaleRequired;
