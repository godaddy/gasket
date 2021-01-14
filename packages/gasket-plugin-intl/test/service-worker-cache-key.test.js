const assume = require('assume');

const serviceWorkerCacheKey = require('../lib/service-worker-cache-key');

describe('serviceWorkerCacheKey', function () {
  let result;

  it('returns getLocale as cache key function', async function () {
    result = await serviceWorkerCacheKey();

    assume(result).instanceOf(Function);
    assume(result.name).equals('getLocale');
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
    assume(result).equals(expectedLocale);
  });
});
