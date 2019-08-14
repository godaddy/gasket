const serviceWorkerCacheKey = require('./service-worker-cache-key');
const defaultConfig = require('./default-config');

jest.mock('fs');

describe('serviceWorkerCacheKey', () => {
  let result, mockGasket;

  beforeEach(() => {
    mockGasket = {
      config: {
        root: '/some-root',
        intl: defaultConfig
      }
    };
  });

  it('returns getLanguage as cache key function', async () => {
    result = await serviceWorkerCacheKey(mockGasket);

    expect(result).toBeInstanceOf(Function);
    expect(result.name).toBe('getLanguage');
  });

  it('cache key function returns a string', async () => {
    const req = {
      store: {
        getState: jest.fn().mockReturnValue({ intl: defaultConfig })
      }
    };

    const getLanguage = await serviceWorkerCacheKey(mockGasket);

    result = getLanguage(req);
    expect(result).toEqual(expect.any(String));
  });
});
