import { createElement } from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';
import { resolveGasketData } from '@gasket/data';
import { GasketDataProvider } from './gasket-data-provider.js';

/** @type {import('./index.d.ts').withGasketDataProvider} */
export function withGasketDataProvider(gasket) {
  return function wrapper(Component) {
    const displayName = Component.displayName || Component.name || 'Component';

    /**
     * Higher-order component that provides Gasket data to the wrapped component.
     * @param {object} props - Props
     * @param {object} props.gasketData - Gasket data to provide
     * @returns {import('react').ReactElement} wrapped component
     */
    function HOC({ gasketData, ...props }) {
      return (
        createElement(GasketDataProvider, { gasketData },
          createElement(Component, /** @type {any} */(props))
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
