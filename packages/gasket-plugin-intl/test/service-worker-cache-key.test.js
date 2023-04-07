const serviceWorkerCacheKey = require('../lib/service-worker-cache-key');

describe('serviceWorkerCacheKey', function () {
  let result;

  it('returns getLocale as cache key function', async function () {
    result = await serviceWorkerCacheKey();

    expect(result).toBeInstanceOf(Function);
    expect(result.name).toEqual('getLocale');
  });

  it('cache key function returns a string', async function () {
    const expectedLocale = 'en-US';
    const req = {};
    const res = {
      locals: {
        gasketData: { intl: { locale: expectedLocale } }
      }
    };

    const getLocale = await serviceWorkerCacheKey();

    result = getLocale(req, res);
    expect(result).toEqual(expectedLocale);
  });

  it('does not fail if gasketData is not fully populated', async function () {
    const req = {};
    const res = { locals: {} };

    const getLocale = await serviceWorkerCacheKey();
    expect(() => getLocale(req, res)).not.toThrow();
  });
});
