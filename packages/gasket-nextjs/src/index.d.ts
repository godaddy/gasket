import type { GasketData } from '@gasket/data';
import type { ComponentType, PropsWithChildren } from 'react';
import type Document, {
  DocumentContext,
  DocumentInitialProps
} from 'next/document';
import type { IncomingMessage, ServerResponse } from 'http';

type SubstitutableHOC<T> = <C extends ComponentType<T>>(component: C) => C;

/** Renders a script tag with JSON gasketData */
export const GasketDataScript: ComponentType<{
  /** Gasket data from response */
  data: GasketData;
}>;

/**
 * Make a wrapper to extend the Next.js Document, injecting a script with the
 * `gasketData` from the response object.
 */
export function withGasketData(options?: {
  /** Force script injection at particular index */
  index?: number;
}): (DocumentClass: typeof Document) => typeof DocumentClass & {
  getInitialProps: typeof GasketDocumentGetInitialProps;
};

/** React hook that fetches GasketData in elements context and returns it */
export function useGasketData(): GasketData;

/**
 * Provider for the GasketData, adds context to child elements.
 */
export const GasketDataProvider: ComponentType<
  PropsWithChildren<{ gasketData: GasketData }>
>;

export declare type GasketDocumentContext = DocumentContext & {
  res: ServerResponse<IncomingMessage> & {
    locals: {
      gasketData: GasketData;
    };
  };
};

export function GasketDocumentGetInitialProps(
  ctx: GasketDocumentContext
): Promise<
  DocumentInitialProps & {
    gasketData: GasketData;
  }
>;

/**
 * Make an HOC that adds a provider for the GasketData. This can be used to wrap
 * a top level React, Next.js custom App component or Next.js custom
 * NextDocument component.
 */
export function withGasketDataProvider(): SubstitutableHOC<{}>;
