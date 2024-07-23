import React, { createElement } from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';
import LocaleFileRequired from './locale-file-required.js';

/**
 * Make an HOC that loads a locale file before rendering wrapped component
 * @type {import('.').withLocaleFileRequired}
 */
export default function withLocaleFileRequired(
  localeFilePaths,
  options = {}
) {
  const { loading = null, forwardRef = false } = options;

  // @ts-ignore
  return function wrapper(Component) {
    const displayName = Component.displayName || Component.name || 'Component';

    /** @type {import('.').LocaleFileRequiredHOC} */
    function HOC(props) {
      const {
        forwardedRef,
        ...rest
      } = props;

      return createElement(
        LocaleFileRequired,
        {
          localeFilePath: localeFilePaths,
          loading
        },
        createElement(
          Component,
          {
            ...rest,
            ref: forwardedRef
          })
      );
    }

    // @ts-ignore - hoistNonReactStatics types are not playing nice...
    hoistNonReactStatics(HOC, Component);
    HOC.displayName = `withLocaleFileRequired(${displayName})`;
    HOC.WrappedComponent = Component;

    // Forward ref through the HOC
    if (!forwardRef) {
      return HOC;
    }

    const Result = React.forwardRef((props, ref) =>
      // @ts-ignore
      createElement(HOC, { ...props, forwardedRef: ref })
    );
    hoistNonReactStatics(Result, Component);
    Result.displayName = `ForwardRef(withLocaleFileRequired/${displayName}))`;
    // @ts-ignore
    Result.WrappedComponent = Component;

    return Result;
  };
}
