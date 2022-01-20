const mockMinify = require('uglify-js');
const { getComposedContent } = require('../lib/utils');
const { getCacheKeys, getSWConfig, loadRegisterScript } = require('../lib/utils');

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
      mockMinify.mockClear();
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
      /* eslint-disable no-undefined */
      mockGasket.config.serviceWorker = {
        cacheKeys: [cacheKeyA, null, undefined, '', {}]
      };
      mockPluginCacheKeys.push(cacheKeyB, null, undefined, '', {});
      results = await getCacheKeys(mockGasket);
      expect(results).toEqual([cacheKeyA, cacheKeyB]);
      /* eslint-enable no-undefined */
    });
  });

  describe('getComposedContent', () => {
    let mockConfig, mockGasket;
    beforeEach(function () {

      mockConfig = {
        url: '/sw.js',
        scope: '/',
        content: '',
        cacheKeys: [],
        cache: {},
        staticOutput: '/some-root/public/sw.js'
      };

      mockGasket = {
        config: {
          root: '/some-root',
          serviceWorker: mockConfig
        },
        logger: {
          log: jest.fn()
        },
        execWaterfall: jest.fn()
      };
    });

    it('executes execWaterfall for composeServiceWorker', async () => {
      mockConfig.content = 'This is preconfigured content';
      const context = {};
      await getComposedContent(mockGasket, context);
      expect(mockGasket.execWaterfall).toHaveBeenCalledWith(
        'composeServiceWorker',
        mockConfig.content,
        context
      );
    });

    it('composed service worker contains expected head content', async () => {
      const results = await getComposedContent(mockGasket);
      expect(results).toEqual(expect.stringContaining('\'use strict\';'));
    });

    it('composed service worker contains composed hook content', async () => {
      mockGasket.execWaterfall.mockResolvedValue('composed content');
      const results = await getComposedContent(mockGasket);
      expect(results).toEqual(expect.stringContaining('composed content'));
    });

    it('does not minifies code in an unknown environment', async () => {
      await getComposedContent(mockGasket);
      expect(mockMinify.minify).not.toHaveBeenCalled();
    });

    it('minifies code in the production environment', async () => {
      mockGasket.config.env = 'production';
      await getComposedContent(mockGasket);
      expect(mockMinify.minify).toHaveBeenCalled();
    });

    it('minifies code if explicitly specified by gasket', async () => {
      mockGasket.config.serviceWorker.minify = {};
      await getComposedContent(mockGasket);
      expect(mockMinify.minify).toHaveBeenCalled();
    });

    it('minifies code if passed a boolean', async () => {
      mockGasket.config.serviceWorker.minify = true;
      await getComposedContent(mockGasket);
      expect(mockMinify.minify).toHaveBeenCalled();
    });

  });

  describe('loadRegisterScript', () => {
    const mockConfig = { url: 'sw.js', scope: '/' };
    let fs;

    beforeEach(() => {
      jest.isolateModules(() => {
        fs = require('fs').promises;
        fs.readFile = jest.fn(() => Promise.resolve('mock {URL} and {SCOPE}'));
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

  describe('getSWConfig', function () {

    it('returns empty object if no config', function () {
      const results = getSWConfig({});
      expect(results).toEqual({});
    });

    it('returns empty object if no sw config', function () {
      const results = getSWConfig({ config: {} });
      expect(results).toEqual({});
    });

    it('returns sw config', function () {
      const results = getSWConfig({ config: { serviceWorker: { bogus: true } } });
      expect(results).toEqual({ bogus: true });
    });
  });
});
