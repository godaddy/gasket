import type { GasketData } from './types';

let _gasketData;

/**
 * Function to retrieve Gasket data from the DOM.
 * This function is intended to be used on the client side only.
 * It retrieves the content of the element with the id 'GasketData' and parses it as JSON.
 * Use in the browser to retrieve data injected by the server.
 */
export function gasketData(): GasketData {
  if (typeof document === 'undefined') {
    // eslint-disable-next-line no-console
    console.error('gasketData() called on server side');
    return;
  }

  if (!_gasketData) {
    const content = (document.getElementById('GasketData') ?? {}).textContent;
    _gasketData = content ? JSON.parse(content) : {};
  }

  return _gasketData;
}
