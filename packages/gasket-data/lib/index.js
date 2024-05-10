/**
 * Function to retrieve Gasket data from the DOM.
 * This function is intended to be used on the client side only.
 * It retrieves the content of the element with the id 'GasketData' and parses it as JSON.
 * Use in the browser to retrieve data injected by the server.
 * @returns {object|undefined} The parsed content of the 'GasketData' element if it exists.
 */
export function gasketData() {
  if (typeof document === 'undefined') {
    // eslint-disable-next-line no-console
    console.error('gasketData() called on server side');
    return;
  }

  const content = (document.getElementById('GasketData') ?? {}).textContent;
  if (content) {
    return JSON.parse(content);
  }
  return content;
}

export default gasketData;
