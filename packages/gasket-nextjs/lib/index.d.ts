import type { GasketData } from '@gasket/data';
import type { ComponentType, FunctionComponent, PropsWithChildren, ReactElement } from 'react';

type SubstitutableHOC<T> = <C extends ComponentType<T>>(component: C) => C;

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
 * Make an HOC that adds a provider for the GasketData. This can be used to wrap
 * a top level React, Next.js custom App component or Next.js custom
 * NextDocument component.
 */
export function withGasketDataProvider(): SubstitutableHOC<{}>;


/**
 * Injects GasketData into html React element
 */
export function injectGasketData(
  html: ReactElement, 
  gasketData: GasketData, 
  lookupIndex: (bodyChildren: ReactElement[], insertIndex: number) => number, 
  insertIndex?: number
): ReactElement;
