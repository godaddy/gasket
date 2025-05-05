import type { GasketData } from '@gasket/data';
import type { Gasket } from '@gasket/core';
import type {
  ComponentType,
  FunctionComponent,
  PropsWithChildren,
  ReactElement
} from 'react';
import type { NextPageContext } from 'next';
import { AppContext } from 'next/app';

declare module '@gasket/data' {
  export interface GasketData {
    intl?: {
      locale: string;
    };
  }
}

export type ComponentWithInitialProps<P = {}> = ComponentType<P> & Partial<{
  getInitialProps: (ctx: NextPageContext | AppContext) => Promise<any>;
}>;

export type WithGasketDataProps = {
  gasketData: GasketData;
};

export type WithLocaleProps = {
  locale: string;
};

export type GasketHOC = <P = {}>(
  Component: ComponentWithInitialProps<P>
) => ComponentWithInitialProps<P & WithGasketDataProps>;

/** Renders a script tag with JSON gasketData */
export function GasketDataScript(props: { data: GasketData }): ReactElement;

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
export function withGasketDataProvider(gasket: Gasket): GasketHOC;

export type LocaleHOC = <P = {}>(
  Component: ComponentWithInitialProps<P>
) => ComponentWithInitialProps<P>;

/**
 * Make an HOC that attaches getInitialProps to inject the intl locale.
 * This can be used to wrap a Next.js App or Page component.
 */
export function withLocaleInitialProps(gasket: Gasket): LocaleHOC;

/**
 * Injects GasketData into html React element
 */
export function injectGasketData(
  html: ReactElement,
  gasketData: GasketData,
  lookupIndex: (bodyChildren: ReactElement[], insertIndex: number) => number,
  insertIndex?: number
): ReactElement;
