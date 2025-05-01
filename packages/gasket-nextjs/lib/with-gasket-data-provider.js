import { createElement } from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';
// @ts-ignore
import { resolveGasketData } from '@gasket/data';
import { GasketDataProvider } from './gasket-data-provider.js';

/** @type {import('.').withGasketDataProvider} */
export function withGasketDataProvider(gasket) {

  // @ts-ignore
  return function wrapper(Component) {
    const displayName = Component.displayName || Component.name || 'Component';

    /**
     * Higher Order Component (HOC) that wraps the provided component with GasketDataProvider.
     * @param {object} params - The parameters object.
     * @param {object} params.gasketData - The gasket data.
     * @param {object} params.props - The rest of the properties.
     * @returns {object} - The created element with GasketDataProvider and the provided component.
     */
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
  };
}
