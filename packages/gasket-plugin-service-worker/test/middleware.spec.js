const middleware = require('../lib/middleware');

describe('middleware', () => {
  let results, mockGasket, mockConfig, mockReq, mockRes, mockNext;

  beforeEach(async () => {
    mockConfig = {
      url: '/sw.js',
      scope: '/',
      content: ''
    };
    mockGasket = {
      config: {
        serviceWorker: mockConfig
      },
      execWaterfall: jest.fn()
    };
    mockReq = {
      path: '/some/page'
    };
    mockRes = {
      set: jest.fn(),
      send: jest.fn()
    };
    mockNext = jest.fn();
  });

  const getLayer = () => {
    return middleware(mockGasket);
  };

  it('returns a middleware function', () => {
    results = middleware(mockGasket);
    expect(results).toEqual(expect.any(Function));
  });

  describe('layer', () => {
    let layer;

    it('attaches swRegisterScript to req', async () => {
      layer = getLayer();
      await layer(mockReq, mockRes, mockNext);
      expect(mockReq).toHaveProperty('swRegisterScript', expect.any(String));
    });

    it('swRegisterScript has content from sw-register.template', async () => {
      layer = getLayer();
      await layer(mockReq, mockRes, mockNext);
      expect(mockReq.swRegisterScript).toContain('navigator.serviceWorker.register');
    });

    it('swRegisterScript has substituted variables', async () => {
      layer = getLayer();
      await layer(mockReq, mockRes, mockNext);
      expect(mockReq.swRegisterScript).not.toContain('{URL}');
      expect(mockReq.swRegisterScript).toContain('/sw.js');

      expect(mockReq.swRegisterScript).not.toContain('{SCOPE}');
      expect(mockReq.swRegisterScript).toContain("scope: '/'");
    });

    it('does not attach swRegisterScript for _next assets req', async () => {
      mockReq.path = '/_next/some/asset.js';
      layer = getLayer();
      await layer(mockReq, mockRes, mockNext);
      expect(mockReq).not.toHaveProperty('swRegisterScript', expect.any(String));
    });
  });
});
