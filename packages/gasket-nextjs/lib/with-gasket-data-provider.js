import { createElement } from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';
import { resolveGasketData } from '@gasket/data';
import { GasketDataProvider } from './gasket-data-provider.js';

/**
 * Make an HOC that adds a provider for the GasketData. This can be used to wrap
 * a top level React, Next.js custom App component or Next.js custom Document
 * component.
 * @returns {Function} wrapper
 */
export function withGasketDataProvider(gasket) {

  return function wrapper(Component) {
    const displayName = Component.displayName || Component.name || 'Component';

    function HOC({ gasketData, ...props }) {
      return (
        createElement(GasketDataProvider, { gasketData },
          createElement(Component, props)
        )
      );
    }

    hoistNonReactStatics(HOC, Component);

    HOC.getInitialProps = async function getInitialProps(ctx) {
      // support app or page context
      const req = ctx.ctx?.req ?? ctx.req;
      const gasketData = await resolveGasketData(gasket, req);
      const initialProps = Component.getInitialProps ? await Component.getInitialProps(ctx) : {};

      return {
        ...initialProps,
        gasketData
      };
    };

    HOC.displayName = `withGasketDataProvider(${displayName})`;
    HOC.WrappedComponent = Component;

    return HOC;
  }
}
