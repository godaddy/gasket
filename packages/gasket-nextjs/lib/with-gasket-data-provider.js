import { createElement } from 'react';
import { GasketDataProvider } from './gasket-data-provider.js';
import PropTypes from 'prop-types';

/**
 * Make an HOC that adds a provider for the GasketData. This can be used to wrap
 * a top level React, Next.js custom App component or Next.js custom Document
 * component.
 * @returns {Function} wrapper
 */
export const withGasketDataProvider = () => (WrappedComponent) => {
  const Wrapper = ({ gasketData, ...props }) => {
    return (
      createElement(GasketDataProvider, { gasketData },
        createElement(WrappedComponent, props)
      )
    );
  };

  Wrapper.getInitialProps = async (data) => {
    const initialProps = WrappedComponent.getInitialProps ? await WrappedComponent.getInitialProps(data) : {};
    // TODO: convert to GasketActions
    const ssrGasketData = data?.ctx?.res?.locals?.gasketData || data?.res?.locals?.gasketData || {};
    let clientGasketData = {}
    if (typeof window !== 'undefined') {
      clientGasketData = await import('@gasket/data').then(mod => {
        return mod.gasketData()
      });
    }

    return {
      ...initialProps,
      gasketData: { ...ssrGasketData, ...clientGasketData }
    };
  };

  Wrapper.propTypes = {
    gasketData: PropTypes.object
  };

  return Wrapper;
};
