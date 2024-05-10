import { jest } from '@jest/globals';

describe('GasketData', function () {
  let getElementByIdStub;

  const importFunction = async () => {
    return import('../lib/index.js').then(mod => mod.default);
  };

  beforeAll(() => {
    Object.defineProperty(global, 'document', {
      writable: true,
      value: {}
    });
    Object.defineProperty(global.document, 'getElementById', {
      writable: true,
      value: jest.fn()
    });
  });

  beforeEach(function () {
    getElementByIdStub = jest.spyOn(global.document, 'getElementById');
  });

  afterEach(function () {
    jest.resetModules();
  });

  it('returns parsed JSON data parsed', async function () {
    getElementByIdStub.mockReturnValueOnce({ textContent: '{"fake":"results"}' });
    const gasketData = await importFunction();
    const results = gasketData();
    expect(results).toEqual({ fake: 'results' });
  });

  it('returns undefined if no element found', async function () {
    getElementByIdStub.mockReturnValueOnce();
    const gasketData = await importFunction();
    const results = gasketData();
    expect(results).toBeUndefined();
  });

  it('returns empty string if no script content', async function () {
    getElementByIdStub.mockReturnValueOnce({ textContent: '' });
    const gasketData = await importFunction();
    const results = gasketData();
    expect(results).toEqual('');
  });

  it('returns undefined and logs error if no document (server)', async function () {
    Object.defineProperty(global, 'document', {
      // eslint-disable-next-line no-undefined
      value: undefined
    });

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

    const gasketData = await importFunction();
    const results = gasketData();
    expect(results).toBeUndefined();

    expect(consoleErrorSpy).toHaveBeenCalledWith('gasketData() called on server side');
  });
});
