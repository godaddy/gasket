import React, { createElement } from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';
import LocaleFileRequired from './locale-file-required.js';

/**
 * Make an HOC that loads a locale file before rendering wrapped component
 * @type {import('.').withLocaleFileRequired}
 */
export default function withLocaleFileRequired(
  localeFilePath,
  options = {}
) {
  const { loading = null, forwardRef = false } = options;

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
          localeFilePath,
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
      return /** @type {import('.').LocaleFileRequiredHOC} */ (HOC);
    }

    const ForwardHOC = React.forwardRef((props, ref) =>
      createElement(HOC, { ...props, forwardedRef: ref })
    );
    hoistNonReactStatics(ForwardHOC, Component);
    ForwardHOC.displayName = `ForwardRef(withLocaleFileRequired/${displayName}))`;
    ForwardHOC.WrappedComponent = Component;

    return /** @type {import('.').LocaleFileRequiredHOC} */ (ForwardHOC);
  };
}
