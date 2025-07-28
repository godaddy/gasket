import type { GasketData } from '@gasket/data';
import type { Gasket } from '@gasket/core';
import type Document from 'next/document';
import type { DocumentContext, DocumentInitialProps } from 'next/document';
import type { IncomingMessage, ServerResponse } from 'http';
import type { FunctionComponent } from 'react';


export function GasketDocumentGetInitialProps(
  ctx: GasketDocumentContext
): Promise<
  DocumentInitialProps & {
    gasketData: GasketData;
  }
>;

type DocumentClass = typeof Document & {
  getInitialProps: typeof GasketDocumentGetInitialProps;
}

type DocumentFunction = typeof FunctionComponent & {
  getInitialProps: typeof GasketDocumentGetInitialProps;
}

/**
 * Make a wrapper to extend the Next.js Document, injecting a script with the
 * `gasketData` from the response object.
 */
export function withGasketData(
  gasket: Gasket,
  options?: {
    /** Force script injection at particular index */
    index?: number;
  }
): (DocumentComponent: typeof Document | typeof FunctionComponent) =>
    typeof DocumentClass | typeof DocumentFunction;

export declare type GasketDocumentContext = DocumentContext & {
  res: ServerResponse<IncomingMessage> & {
    locals: {
      gasketData: GasketData;
    };
  };
};
