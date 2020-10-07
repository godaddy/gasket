const assume = require('assume');

const serviceWorkerCacheKey = require('../lib/service-worker-cache-key');

describe('serviceWorkerCacheKey', () => {
  let result;

  it('returns getLocale as cache key function', async () => {
    result = await serviceWorkerCacheKey();

    assume(result).instanceOf(Function);
    assume(result.name).equals('getLocale');
  });

  it('cache key function returns a string', async () => {
    const expectedLocale = 'en-US';
    const req = {};
    const res = { gasketData: { intl: { locale: expectedLocale } } };

    const getLocale = await serviceWorkerCacheKey();

    result = getLocale(req, res);
    assume(result).equals(expectedLocale);
  });
});
