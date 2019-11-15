const { getCacheKeys } = require('../lib/utils');

describe('getCacheKeys', () => {
  const cacheKeyA = () => 'A';
  const cacheKeyB = () => 'B';


  let results, mockGasket, mockExec, mockPluginCacheKeys;

  beforeEach(() => {
    mockPluginCacheKeys = [];
    mockExec = jest.fn().mockResolvedValue(mockPluginCacheKeys);
    mockGasket = {
      config: {},
      exec: mockExec
    };
  });

  it('executes exec for serviceWorkerCacheKey lifecycle', async () => {
    results = await getCacheKeys(mockGasket);
    expect(mockExec).toHaveBeenCalledWith('serviceWorkerCacheKey');
  });

  it('adds cache keys from plugins to config', async () => {
    mockPluginCacheKeys.push(cacheKeyA);
    results = await getCacheKeys(mockGasket);
    expect(results.serviceWorker).toHaveProperty('cacheKeys');
    expect(results).toEqual([cacheKeyA]);
  });

  it('adds cache keys from gasket.config to config', async () => {
    results = await getCacheKeys(mockGasket, {
      serviceWorker: {
        cacheKeys: [cacheKeyA]
      }
    });
    expect(results).toEqual([cacheKeyA]);
  });

  it('merges plugin and gasket.config cache keys', async () => {
    mockPluginCacheKeys.push(cacheKeyB);
    results = await getCacheKeys(mockGasket, {
      serviceWorker: {
        cacheKeys: [cacheKeyA]
      }
    });
    expect(results).toEqual([cacheKeyA, cacheKeyB]);
  });

  it('filters non-function cache keys', async () => {
    mockPluginCacheKeys.push(cacheKeyB, null, undefined, '', {});
    results = await getCacheKeys(mockGasket, {
      serviceWorker: {
        cacheKeys: [cacheKeyA, null, undefined, '', {}]
      }
    });
    expect(results).toEqual([cacheKeyA, cacheKeyB]);
  });
});
