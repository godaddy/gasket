const utils = require('../lib/utils');
jest.mock('../lib/utils');
const middleware = require('../lib/middleware');

const mockRegisterScript = 'mock script';

describe('middleware', () => {
  let results, mockGasket, mockConfig, mockReq, mockRes, mockNext;

  beforeEach(async () => {
    utils.loadRegisterScript.mockReturnValue(mockRegisterScript);
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
      expect(mockReq.swRegisterScript).toContain(mockRegisterScript);
    });
  });
});
