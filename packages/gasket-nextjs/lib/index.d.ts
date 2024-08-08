import type { GasketData } from '@gasket/data';
import type { Gasket } from '@gasket/core';
import type { ComponentType, FunctionComponent, PropsWithChildren, ReactElement } from 'react';

ComponentWithInitialProps<T> = ComponentType<T> & Partial<{
  getInitialProps: (ctx: NextPageContext) => Promise<any>
}>;

type SubstitutableHOC<T> = <C extends ComponentWithInitialProps<T>>(component: C) => C;

/** Renders a script tag with JSON gasketData */
export const GasketDataScript: FunctionComponent<{
  /** Gasket data from response */
  data: GasketData;
}>;

/** React hook that fetches GasketData in elements context and returns it */
export function useGasketData(): GasketData;

/**
 * Provider for the GasketData, adds context to child elements.
 */
export const GasketDataProvider: FunctionComponent<
  PropsWithChildren<{ gasketData: GasketData }>
>;

/**
 * Make an HOC that adds a provider for the GasketData.
 * This can be used to wrap a Next.js App or Page component.
 */
export function withGasketDataProvider(gasket: Gasket): SubstitutableHOC<{}>;

/**
 * Make an HOC that attach getInitialProps to inject the intl locale.
 * This can be used to wrap a Next.js App or Page component.
 */
export function withLocaleInitialProps(gasket: Gasket): SubstitutableHOC<{}>;

/**
 * Injects GasketData into html React element
 */
export function injectGasketData(
  html: ReactElement,
  gasketData: GasketData,
  lookupIndex: (bodyChildren: ReactElement[], insertIndex: number) => number,
  insertIndex?: number
): ReactElement;
