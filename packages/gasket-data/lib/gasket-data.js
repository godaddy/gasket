let _gasketData;

/** @type {import('./index.d.ts').gasketData} */
export function gasketData() {
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
