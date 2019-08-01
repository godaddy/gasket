const mockCache = require('lru-cache');
const mockMinify = require('uglify-js');
const express = require('../lib/express');

describe('express', () => {
  let results, mockGasket, mockApp, mockConfig, mockReq, mockRes;
  let cacheKeyA, cacheKeyB;

  beforeEach(() => {
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

  const getEndpoint = () => {
    express(mockGasket, mockApp);
    return mockApp.get.mock.calls[0][1];
  };

  it('sets app get endpoint', () => {
    results = express(mockGasket, mockApp);
    expect(mockApp.get).toHaveBeenCalledWith('/sw.js', expect.any(Function));
  });

  it('configures cache', () => {
    results = express(mockGasket, mockApp);
    expect(mockCache).toHaveBeenCalledWith(mockConfig.cache);
  });

  describe('endpoint', () => {

    it('executes execWaterfall for composeServiceWorker', async () => {
      mockConfig.content = 'This is preconfigured content';
      const endpoint = getEndpoint();
      await endpoint(mockReq, mockRes);
      expect(mockGasket.execWaterfall).toHaveBeenCalledWith(
        'composeServiceWorker',
        mockConfig.content,
        mockReq
      );
    });

    it('sets response header content-type', async () => {
      const endpoint = getEndpoint();
      await endpoint(mockReq, mockRes);
      expect(mockRes.set).
        toHaveBeenCalledWith('Content-Type', 'application/javascript');
    });

    it('sends the compose service worker response', async () => {
      const endpoint = getEndpoint();
      await endpoint(mockReq, mockRes);
      expect(mockRes.send).toHaveBeenCalled();
    });

    it('composed service worker contains expected head content', async () => {
      const endpoint = getEndpoint();
      await endpoint(mockReq, mockRes);
      expect(mockRes.send).
        toHaveBeenCalledWith(expect.stringContaining('\'use strict\';'));
    });

    it('composed service worker contains composed hook content', async () => {
      mockGasket.execWaterfall.mockResolvedValue('composed content');
      const endpoint = getEndpoint();
      await endpoint(mockReq, mockRes);
      expect(mockRes.send).
        toHaveBeenCalledWith(expect.stringContaining('composed content'));
    });

    it('executes cache key functions', async () => {
      mockConfig.cacheKeys = [cacheKeyA, cacheKeyB];
      const endpoint = getEndpoint();
      await endpoint(mockReq, mockRes);
      expect(cacheKeyA).toHaveBeenCalledWith(mockReq);
      expect(cacheKeyB).toHaveBeenCalledWith(mockReq);
    });

    it('looks up existing cached content with generated key', async () => {
      mockConfig.cacheKeys = [cacheKeyA, cacheKeyB];
      const endpoint = getEndpoint();
      await endpoint(mockReq, mockRes);
      expect(mockCache.getStub).toHaveBeenCalledWith('_AB')
    });

    it('set new cached content with generated key', async () => {
      mockConfig.cacheKeys = [cacheKeyA, cacheKeyB];
      const endpoint = getEndpoint();
      await endpoint(mockReq, mockRes);
      expect(mockCache.setStub).toHaveBeenCalledWith(
        '_AB',
        expect.stringContaining('use strict')
      )
    });

    it('executes composeServiceWorker if no cached content', async () => {
      const endpoint = getEndpoint();
      await endpoint(mockReq, mockRes);
      expect(mockGasket.execWaterfall).toHaveBeenCalled();
    });


    it('does not minifies code in an unknown environment', async () => {
      const endpoint = getEndpoint();
      await endpoint(mockReq, mockRes);
      expect(mockMinify.minify).not.toHaveBeenCalled();
    });

    it('minifies code in the production environment', async () => {
      mockGasket.config.env = 'production';
      const endpoint = getEndpoint();
      await endpoint(mockReq, mockRes);
      expect(mockMinify.minify).toHaveBeenCalled();
    });

    it('minifies code if explicitly specified by gasket', async () => {
      mockGasket.config.serviceWorker.minify = { };
      const endpoint = getEndpoint();
      await endpoint(mockReq, mockRes);
      expect(mockMinify.minify).toHaveBeenCalled();
    });

    it('minifies code if passed a boolean', async () => {
      mockGasket.config.serviceWorker.minify = true;
      const endpoint = getEndpoint();
      await endpoint(mockReq, mockRes);
      expect(mockMinify.minify).toHaveBeenCalled();
    });

    it('does not execute composeServiceWorker for cached content', async () => {
      mockCache.getStub.mockReturnValue('bogus content');
      const endpoint = getEndpoint();
      await endpoint(mockReq, mockRes);
      expect(mockGasket.execWaterfall).not.toHaveBeenCalled();
    });
  });
});
