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
        // eslint-disable-next-line react/prop-types
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

    hoistNonReactStatics(HOC, Component);
    HOC.displayName = `withLocaleFileRequired(${displayName})`;
    HOC.WrappedComponent = Component;

    // Forward ref through the HOC
    if (!forwardRef) {
      return HOC;
    }

    const ForwardHOC = React.forwardRef((props, ref) =>
      createElement(HOC, { ...props, forwardedRef: ref })
    );
    hoistNonReactStatics(ForwardHOC, Component);
    ForwardHOC.displayName = `ForwardRef(withLocaleFileRequired/${displayName}))`;
    // @ts-ignore - add WrappedComponent to forwardRef result
    ForwardHOC.WrappedComponent = Component;

    return ForwardHOC;
  };
}
