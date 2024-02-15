const { promisify } = require('util');
const middleware = require('../lib/middleware');
const { gasketDataMap } = require('../lib/data-map');


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

  it('executes before the "redux" middleware', async () => {
    expect(middleware.timing.before).toContain('@gasket/plugin-redux');
  });

  it('sets a `locals.gasketData` property on the response object', async () => {
    const mockData = { some: 'data', public: { some: 'public data' } };
    gasketDataMap.set(gasket, mockData);
    const middlewareMock = promisify(middleware.handler(gasket));

    await middlewareMock(mockReq, mockRes);

    expect(mockRes.locals).toHaveProperty('gasketData', mockData.public);
  });

  it('allows `responseData` hooks to modify the public data', async () => {
    gasketDataMap.set(gasket, { public: { some: 'data' } });
    gasket.execWaterfall.mockImplementation((event, gasketData, { req, res }) => {
      expect(event).toEqual('responseData');
      expect(req).toEqual(mockReq);
      expect(res).toEqual(mockRes);

      return {
        ...gasketData,
        locale: req.cookies.market
      };
    });
    const middlewareMock = promisify(middleware.handler(gasket));

    await middlewareMock(mockReq, mockRes);

    expect(mockRes.locals.gasketData).toEqual({
      some: 'data',
      locale: 'de-DE'
    });
  });

  it('mutating public response data does not damage original', async () => {
    const original = { public: { details: 'original' } };
    gasketDataMap.set(gasket, original);
    gasket.execWaterfall.mockImplementation((event, gasketData, { req, res }) => {
      expect(event).toEqual('responseData');
      expect(req).toEqual(mockReq);
      expect(res).toEqual(mockRes);

      gasketData.details = 'modified';
      return gasketData;
    });
    const middlewareMock = promisify(middleware.handler(gasket));

    await middlewareMock(mockReq, mockRes);

    expect(mockRes.locals.gasketData).not.toBe(original.public);

    expect(mockRes.locals.gasketData).toEqual({
      details: 'modified'
    });

    expect(original.public).toEqual({
      details: 'original'
    });
  });

  it('descriptive error when config is not present in `responseData` hooks', async () => {
    gasketDataMap.delete(gasket);
    gasket.execWaterfall.mockImplementation((event, config, { req, res }) => {
      expect(event).toEqual('responseData');
      expect(req).toEqual(mockReq);
      expect(res).toEqual(mockRes);
    });

    const middlewareMock = promisify(middleware.handler(gasket));

    await expect(middlewareMock(mockReq, mockRes)).rejects.toThrow(
      'An responseData lifecycle hook did not return a config object.'
    );
  });

  it('does not swallow errors from `responseData` hooks', async () => {
    gasketDataMap.set(gasket, { some: 'config' });
    gasket.execWaterfall.mockImplementation(() => {
      return Promise.reject(new Error('Something bad'));
    });
    const middlewareMock = promisify(middleware.handler(gasket));

    await expect(middlewareMock(mockReq, mockRes)).rejects.toThrow();
  });

  it('adds public config property to locals response', async () => {
    const mockData = { public: { test: 'data' } };
    gasketDataMap.set(gasket, mockData);
    const middlewareMock = promisify(middleware.handler(gasket));

    await middlewareMock(mockReq, mockRes);

    expect(mockRes.locals.gasketData).toEqual(expect.objectContaining(mockData.public));
  });

  it('adds nothing to locals response if public config not set', async () => {
    const mockData = {};
    gasketDataMap.set(gasket, mockData);
    const middlewareMock = promisify(middleware.handler(gasket));

    await middlewareMock(mockReq, mockRes);

    expect(mockRes.locals.gasketData).toBeUndefined();
  });
});
