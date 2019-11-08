const configure = require('../lib/configure');

describe('configure', () => {
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

  it('returns config with serviceWorker settings', async () => {
    results = await configure(mockGasket);
    expect(results).toHaveProperty('serviceWorker');
  });

  it('retains base config settings', async () => {
    results = await configure(mockGasket, { bogus: 'BOGUS' });
    expect(results).toHaveProperty('bogus', 'BOGUS');
  });

  it('sets defaults', async () => {
    results = await configure(mockGasket);
    expect(results.serviceWorker).toEqual({
      'url': '/sw.js',
      scope: '/',
      content: '',
      cacheKeys: expect.any(Array),
      cache:{
        maxAge: 1000 * 60 * 60 * 24 * 5, // 5 days
        updateAgeOnGet: true
      }
    });
  });

  it('allows serviceWorker settings to be customized by user', async () => {
    results = await configure(mockGasket, {
      serviceWorker: {
        url: '/some-sw.js'
      }
    });
    expect(results.serviceWorker).toHaveProperty('url', '/some-sw.js');
  });

  it('executes exec for serviceWorkerCacheKey lifecycle', async () => {
    results = await configure(mockGasket);
    expect(mockExec).toHaveBeenCalledWith('serviceWorkerCacheKey');
  });

  it('adds cache keys from plugins to config', async () => {
    mockPluginCacheKeys.push(cacheKeyA);
    results = await configure(mockGasket);
    expect(results.serviceWorker).toHaveProperty('cacheKeys');
    expect(results.serviceWorker.cacheKeys).toEqual([cacheKeyA]);
  });

  it('adds cache keys from gasket.config to config', async () => {
    results = await configure(mockGasket, {
      serviceWorker: {
        cacheKeys: [cacheKeyA]
      }
    });
    expect(results.serviceWorker).toHaveProperty('cacheKeys');
    expect(results.serviceWorker.cacheKeys).toEqual([cacheKeyA]);
  });

  it('merges plugin and gasket.config cache keys', async () => {
    mockPluginCacheKeys.push(cacheKeyB);
    results = await configure(mockGasket, {
      serviceWorker: {
        cacheKeys: [cacheKeyA]
      }
    });
    expect(results.serviceWorker.cacheKeys).toEqual([cacheKeyA, cacheKeyB]);
  });

  it('filters non-function cache keys', async () => {
    mockPluginCacheKeys.push(cacheKeyB, null, undefined, '', {});
    results = await configure(mockGasket, {
      serviceWorker: {
        cacheKeys: [cacheKeyA, null, undefined, '', {}]
      }
    });
    expect(results.serviceWorker.cacheKeys).toEqual([cacheKeyA, cacheKeyB]);
  });
});
