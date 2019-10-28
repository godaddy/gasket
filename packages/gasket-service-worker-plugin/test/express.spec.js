const mockCache = require('lru-cache');
const mockMinify = require('uglify-js');
const express = require('../lib/express');

jest.mock('../lib/utils');
const { getCacheKeys } = require('../lib/utils');

describe('express', () => {
  let mockGasket, mockApp, mockConfig, mockReq, mockRes, mockCacheKeys;
  let cacheKeyA, cacheKeyB;

  beforeEach(() => {
    mockCacheKeys = [];
    getCacheKeys.mockReturnValue(Promise.resolve(mockCacheKeys));

    mockConfig = {
      url: '/sw.js',
      scope: '/',
      content: '',
      cacheKeys: [],
      cache: {}
    };
    mockGasket = {
      config: {
        serviceWorker: mockConfig
      },
      execWaterfall: jest.fn(),
      logger: {
        info: jest.fn()
      }
    };
    mockApp = {
      get: jest.fn()
    };
    mockReq = {};
    mockRes = {
      set: jest.fn(),
      send: jest.fn()
    };
    mockCache.mockClear();
    mockMinify.mockClear();

    cacheKeyA = jest.fn(() => 'A');
    cacheKeyB = jest.fn(() => 'B');
  });

  async function getEndpoint() {
    await express(mockGasket, mockApp);
    return mockApp.get.mock.calls[0][1];
  }

  it('sets app get endpoint', async () => {
    await express(mockGasket, mockApp);
    expect(mockApp.get).toHaveBeenCalledWith('/sw.js', expect.any(Function));
  });

  it('configures cache', async () => {
    await express(mockGasket, mockApp);
    expect(mockCache).toHaveBeenCalledWith(mockConfig.cache);
  });

  describe('endpoint', () => {

    it('executes execWaterfall for composeServiceWorker', async () => {
      mockConfig.content = 'This is preconfigured content';
      const endpoint = await getEndpoint();
      await endpoint(mockReq, mockRes);
      expect(mockGasket.execWaterfall).toHaveBeenCalledWith(
        'composeServiceWorker',
        mockConfig.content,
        mockReq
      );
    });

    it('sets response header content-type', async () => {
      const endpoint = await getEndpoint();
      await endpoint(mockReq, mockRes);
      expect(mockRes.set).toHaveBeenCalledWith('Content-Type', 'application/javascript');
    });

    it('sends the compose service worker response', async () => {
      const endpoint = await getEndpoint();
      await endpoint(mockReq, mockRes);
      expect(mockRes.send).toHaveBeenCalled();
    });

    it('composed service worker contains expected head content', async () => {
      const endpoint = await getEndpoint();
      await endpoint(mockReq, mockRes);
      expect(mockRes.send).toHaveBeenCalledWith(expect.stringContaining('\'use strict\';'));
    });

    it('composed service worker contains composed hook content', async () => {
      mockGasket.execWaterfall.mockResolvedValue('composed content');
      const endpoint = await getEndpoint();
      await endpoint(mockReq, mockRes);
      expect(mockRes.send).toHaveBeenCalledWith(expect.stringContaining('composed content'));
    });

    it('executes cache key functions', async () => {
      mockCacheKeys.push(cacheKeyA, cacheKeyB);
      const endpoint = await getEndpoint();
      await endpoint(mockReq, mockRes);
      expect(cacheKeyA).toHaveBeenCalledWith(mockReq);
      expect(cacheKeyB).toHaveBeenCalledWith(mockReq);
    });

    it('looks up existing cached content with generated key', async () => {
      mockCacheKeys.push(cacheKeyA, cacheKeyB);
      const endpoint = await getEndpoint();
      await endpoint(mockReq, mockRes);
      expect(mockCache.getStub).toHaveBeenCalledWith('_AB')
    });

    it('set new cached content with generated key', async () => {
      mockCacheKeys.push(cacheKeyA, cacheKeyB);
      const endpoint = await getEndpoint();
      await endpoint(mockReq, mockRes);
      expect(mockCache.setStub).toHaveBeenCalledWith(
        '_AB',
        expect.stringContaining('use strict')
      );
    });

    it('executes composeServiceWorker if no cached content', async () => {
      const endpoint = await getEndpoint();
      await endpoint(mockReq, mockRes);
      expect(mockGasket.execWaterfall).toHaveBeenCalled();
    });


    it('does not minifies code in an unknown environment', async () => {
      const endpoint = await getEndpoint();
      await endpoint(mockReq, mockRes);
      expect(mockMinify.minify).not.toHaveBeenCalled();
    });

    it('minifies code in the production environment', async () => {
      mockGasket.config.env = 'production';
      const endpoint = await getEndpoint();
      await endpoint(mockReq, mockRes);
      expect(mockMinify.minify).toHaveBeenCalled();
    });

    it('minifies code if explicitly specified by gasket', async () => {
      mockGasket.config.serviceWorker.minify = {};
      const endpoint = await getEndpoint();
      await endpoint(mockReq, mockRes);
      expect(mockMinify.minify).toHaveBeenCalled();
    });

    it('minifies code if passed a boolean', async () => {
      mockGasket.config.serviceWorker.minify = true;
      const endpoint = await getEndpoint();
      await endpoint(mockReq, mockRes);
      expect(mockMinify.minify).toHaveBeenCalled();
    });

    it('does not execute composeServiceWorker for cached content', async () => {
      mockCache.getStub.mockReturnValue('bogus content');
      const endpoint = await getEndpoint();
      await endpoint(mockReq, mockRes);
      expect(mockGasket.execWaterfall).not.toHaveBeenCalled();
    });
  });
});
