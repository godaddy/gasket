import React, { ReactNode } from 'react';

type ContextProps = { ctx?: { res?: { locals?: { gasketData?: Record<string, unknown> } } } };
type SsrComponentType<P> = ComponentType<P> & { getInitialProps?: (data: ContextProps) => Promise<Record<string, unknown>> };
type ComponentType<P> = React.ComponentType<P>;
type WrapperProps<P, GD> = P & withGasketDataProps<GD>;
type WrapperResponse<P, GD> = React.ComponentType<WrapperProps<P, GD>>;

const clientGasketData = typeof window === 'object' ? require('@gasket/data') : {};


export type withGasketDataProps<GD = Record<string, unknown>> = {
  gasketData?: GD,
  children?: ReactNode
};

export function withGasketData<P, GD>(WrappedComponent: ComponentType<P>): WrapperResponse<P, GD> {

  const Wrapper = (props: WrapperProps<P, GD>) => {
    return <WrappedComponent {...props}/>;
  };

  Wrapper.getInitialProps = async (data: ContextProps) => {
    const Component = WrappedComponent as SsrComponentType<P>;
    const initialProps = Component.getInitialProps ? await Component.getInitialProps(data) : {};
    const ssrGasketData = data?.ctx?.res?.locals?.gasketData || {};

    return { ...initialProps, gasketData: { ...ssrGasketData, ...clientGasketData } };
  };

  return Wrapper;
}
