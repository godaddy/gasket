import React from 'react';
import { GasketDataProvider } from './GasketDataProvider';

let gasketData: Record<string, unknown> = null;
if (typeof window === 'object') {
  gasketData = require('@gasket/data');
}

type ContextProps = {
  ctx?: {
    res?: {
      locals?: {
        gasketData?: Record<string, unknown>
      }
    }
  }
}

type WrappedComponentType<T> = React.ComponentType<T> & { getInitialProps?: (data: unknown) => unknown };

export const withGasketData = <T extends unknown = Record<string, unknown>>(WrappedComponent: WrappedComponentType<T>) => {
  const Wrapper = (props: T) => {
    return <GasketDataProvider data={gasketData}>
      <WrappedComponent {...props} />
    </GasketDataProvider>;
  };

  Wrapper.getInitialProps = async (data: ContextProps) => {
    const { res } = data.ctx;
    if (res) {
      gasketData = res?.locals?.gasketData;
    }

    if (WrappedComponent.getInitialProps) {
      return await WrappedComponent.getInitialProps(data);
    }

    return {};
  };

  return Wrapper;
};
