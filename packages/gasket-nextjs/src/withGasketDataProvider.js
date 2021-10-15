import React from 'react';
import { GasketDataProvider } from './GasketDataProvider';
import PropTypes from 'prop-types';

const clientGasketData = typeof window === 'object' ? require('@gasket/data') : {};

export const withGasketDataProvider = () => (WrappedComponent) => {

  const Wrapper = ({ gasketData, ...props }) => {
    return (
      <GasketDataProvider gasketData={ gasketData }>
        <WrappedComponent { ...props }/>
      </GasketDataProvider>
    );
  };

  Wrapper.getInitialProps = async (data) => {
    const initialProps  = WrappedComponent.getInitialProps ? await WrappedComponent.getInitialProps(data) : {};
    const ssrGasketData = data?.ctx?.res?.locals?.gasketData || data?.res?.locals?.gasketData || {};

    return { ...initialProps, gasketData: { ...ssrGasketData, ...clientGasketData } };
  };

  Wrapper.propTypes = {
    gasketData: PropTypes.object
  };

  return Wrapper;
};
