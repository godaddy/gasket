import React from 'react';
import { GasketDataProvider } from './gasket-data-provider';
import PropTypes from 'prop-types';

const clientGasketData =
  typeof window === 'object' ? require('@gasket/data') : {};

/**
 * Make an HOC that adds a provider for the GasketData. This can be used to wrap
 * a top level React, Next.js custom App component or Next.js custom Document
 * component.
 * @returns {Function} wrapper
 */
export const withGasketDataProvider = () => (WrappedComponent) => {
  const Wrapper = ({ gasketData, ...props }) => {
    return (
      <GasketDataProvider gasketData={ gasketData }>
        <WrappedComponent { ...props } />
      </GasketDataProvider>
    );
  };

  Wrapper.getInitialProps = async (data) => {
    const initialProps = WrappedComponent.getInitialProps
      ? await WrappedComponent.getInitialProps(data)
      : {};
    const ssrGasketData =
      data?.ctx?.res?.locals?.gasketData || data?.res?.locals?.gasketData || {};

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
