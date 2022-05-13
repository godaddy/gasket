const { promisify } = require('util');
const middleware = require('../lib/middleware');
const { ENV_CONFIG } = require('../lib/constants');
const sinon = require('sinon');

describe('middleware', function () {
  let gasket, mockReq, mockRes;

  beforeEach(() => {
    gasket = {
      config: {},
      execWaterfall: jest.fn((event, config) => Promise.resolve(config))
    };

    mockReq = { mock: 'request', cookies: { market: 'de-DE' } };
    mockRes = { mock: 'response', locals: {} };
  });

  afterEach(function () {
    sinon.restore();
  });

  it('executes before the "redux" middleware', async () => {
    expect(middleware.timing.before).toContain('@gasket/plugin-redux');
  });

  it('sets a `config` property on the request object', async () => {
    const mockConfig = { some: 'config' };
    gasket[ENV_CONFIG] = mockConfig;
    const middlewareMock = promisify(middleware.handler(gasket));

    await middlewareMock(mockReq, mockRes);

    expect(mockReq).toHaveProperty('config', mockConfig);
  });

  it('allows `appRequestConfig` hooks to modify the config', async () => {
    gasket[ENV_CONFIG] = { some: 'config' };
    gasket.execWaterfall.mockImplementation((event, config, req, res) => {
      expect(event).toEqual('appRequestConfig');
      expect(req).toEqual(mockReq);
      expect(res).toEqual(mockRes);

      return {
        ...config,
        locale: req.cookies.market
      };
    });
    const middlewareMock = promisify(middleware.handler(gasket));

    await middlewareMock(mockReq, mockRes);

    expect(mockReq.config).toEqual({
      some: 'config',
      locale: 'de-DE'
    });
  });

  it('descriptive error when config is not present in `appRequestConfig` hooks', async () => {
    gasket[ENV_CONFIG] = undefined;
    gasket.execWaterfall.mockImplementation((event, config, req, res) => {
      expect(event).toEqual('appRequestConfig');
      expect(req).toEqual(mockReq);
      expect(res).toEqual(mockRes);

      return undefined;
    });

    const middlewareMock = promisify(middleware.handler(gasket));

    await expect(middlewareMock(mockReq, mockRes)).rejects.toThrowError(
      'req.config is undefined - Ensure that all plugins hooking into the appRequestConfig and appEnvConfig lifecycle return a config object.'
    );
  });

  it('does not swallow errors from `appRequestConfig` hooks', async () => {
    gasket[ENV_CONFIG] = { some: 'config' };
    gasket.execWaterfall.mockImplementation(() => {
      return Promise.reject(new Error('Something bad'));
    });
    const middlewareMock = promisify(middleware.handler(gasket));

    await expect(middlewareMock(mockReq, mockRes)).rejects.toThrow();
  });

  it('adds public config property to locals response', async () => {
    const mockConfig = { public: { test: 'config' } };
    gasket[ENV_CONFIG] = mockConfig;
    const middlewareMock = promisify(middleware.handler(gasket));

    await middlewareMock(mockReq, mockRes);

    expect(mockRes.locals.gasketData).toHaveProperty('config', { test: 'config' });
  });

  it('adds nothing to locals response if public config not set', async () => {
    const mockConfig = {};
    gasket[ENV_CONFIG] = mockConfig;
    const middlewareMock = promisify(middleware.handler(gasket));

    await middlewareMock(mockReq, mockRes);

    expect(mockRes.locals.gasketData).toBeUndefined();
  });

});
