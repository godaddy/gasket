import type { Gasket, GasketRequest } from '@gasket/core';
import type { IncomingMessage } from 'http';

declare module '@gasket/data' {
  export interface GasketData {
    config?: { [key: string | number]: string | undefined };
  }
}

/**
 * Function to retrieve Gasket data from the DOM.
 * This function is intended to be used on the client side only.
 * It retrieves the content of the element with the id 'GasketData' and parses it as JSON.
 * Use in the browser to retrieve data injected by the server.
 */
export function gasketData(): GasketData;

export function resolveGasketData(gasket: Gasket, req: GasketRequest | IncomingMessage ): Promise<GasketData>;
