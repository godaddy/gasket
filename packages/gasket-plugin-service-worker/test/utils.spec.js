const { getCacheKeys, loadRegisterScript } = require('../lib/utils');

describe('utils', () => {
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
      expect(results).toEqual([cacheKeyA]);
    });

    it('adds cache keys from gasket.config to config', async () => {
      mockGasket.config.serviceWorker = {
        cacheKeys: [cacheKeyA]
      };
      results = await getCacheKeys(mockGasket);
      expect(results).toEqual([cacheKeyA]);
    });

    it('merges plugin and gasket.config cache keys', async () => {
      mockGasket.config.serviceWorker = {
        cacheKeys: [cacheKeyA]
      };
      mockPluginCacheKeys.push(cacheKeyB);
      results = await getCacheKeys(mockGasket);
      expect(results).toEqual([cacheKeyA, cacheKeyB]);
    });

    it('filters non-function cache keys', async () => {
      mockGasket.config.serviceWorker = {
        cacheKeys: [cacheKeyA, null, undefined, '', {}]
      };
      mockPluginCacheKeys.push(cacheKeyB, null, undefined, '', {});
      results = await getCacheKeys(mockGasket);
      expect(results).toEqual([cacheKeyA, cacheKeyB]);
    });
  });

  describe('loadRegisterScript', () => {
    const mockConfig = { url: 'sw.js', scope: '/' };
    let fs;

    beforeEach(() => {
      jest.isolateModules(() => {
        fs = require('fs');
        fs.readFile = jest.fn((path, options, callback) => callback(null, 'mock {URL} and {SCOPE}'));
      });
    });

    it('only reads the template file once', async () => {
      await loadRegisterScript(mockConfig);
      expect(fs.readFile).toHaveBeenCalledTimes(1);
      await loadRegisterScript(mockConfig);
      expect(fs.readFile).toHaveBeenCalledTimes(1);
    });

    it('replaces variables from config', async () => {
      const results = await loadRegisterScript(mockConfig);
      expect(results).toContain(mockConfig.url);
      expect(results).toContain(mockConfig.scope);
    });
  });
});
