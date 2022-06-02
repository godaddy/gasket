const mockCache = require('lru-cache');
const mockMinify = require('uglify-js');
const fastify = require('../lib/fastify');

describe('fastify', () => {
  let mockGasket, mockApp, mockConfig, mockReq, mockRes, mockCacheKeys;
  let cacheKeyA, cacheKeyB;

  beforeEach(() => {
    mockCacheKeys = [];

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
      exec: jest.fn().mockReturnValue(Promise.resolve(mockCacheKeys)),
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
    await fastify(mockGasket, mockApp);
    return mockApp.get.mock.calls[0][1];
  }

  it('sets app get endpoint', async () => {
    await fastify(mockGasket, mockApp);
    expect(mockApp.get).toHaveBeenCalledWith('/sw.js', expect.any(Function));
  });

  it('does not setup endpoint if staticOutput is configured', async () => {
    mockConfig.staticOutput = './public/sw.js';
    await fastify(mockGasket, mockApp);
    expect(mockApp.get).not.toHaveBeenCalled();
  });

  it('configures cache', async () => {
    await fastify(mockGasket, mockApp);
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
        expect.objectContaining({ req: mockReq, res: mockRes })
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

    it('executes cache key functions', async () => {
      mockCacheKeys.push(cacheKeyA, cacheKeyB);
      const endpoint = await getEndpoint();
      await endpoint(mockReq, mockRes);
      expect(cacheKeyA).toHaveBeenCalledWith(mockReq, mockRes);
      expect(cacheKeyB).toHaveBeenCalledWith(mockReq, mockRes);
    });

    it('looks up existing cached content with generated key', async () => {
      mockCacheKeys.push(cacheKeyA, cacheKeyB);
      const endpoint = await getEndpoint();
      await endpoint(mockReq, mockRes);
      expect(mockCache.getStub).toHaveBeenCalledWith('_AB');
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

    it('does not execute composeServiceWorker for cached content', async () => {
      mockCache.getStub.mockReturnValue('bogus content');
      const endpoint = await getEndpoint();
      await endpoint(mockReq, mockRes);
      expect(mockGasket.execWaterfall).not.toHaveBeenCalled();
    });
  });
});
