/**
 * Represents the data structure injected into the client by the Gasket framework.
 *
 * This is typically embedded in the HTML by the server and retrieved in the browser via `gasketData()`.
 */
export type GasketData = {
  config?: { [key: string | number]: string | undefined };
};
