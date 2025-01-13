import type { Gasket, GasketRequest } from '@gasket/core';
import type { IncomingMessage } from 'http';

declare module '@gasket/data' {
  /**
   * Represents the structure of the Gasket data object.
   */
  export interface GasketData {
    config?: Record<string | number, string | undefined>;
  }

  /**
   * Function to retrieve Gasket data from the DOM.
   * This function is intended to be used on the client side only.
   * It retrieves the content of the element with the id 'GasketData' and parses it as JSON.
   * Use in the browser to retrieve data injected by the server.
   */
  export function gasketData(): GasketData;

  /**
   * Function to resolve Gasket data, combining server and request context.
   * @param gasket - The Gasket instance.
   * @param req - The request object, either a GasketRequest or IncomingMessage.
   * @returns A promise resolving to the GasketData object.
   */
  export function resolveGasketData(gasket: Gasket, req: GasketRequest | IncomingMessage): Promise<GasketData>;
}
