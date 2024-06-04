const { promisify } = require('util');
const middleware = require('../lib/middleware');


describe('middleware', function () {
  let gasket, mockReq, mockRes, getPublicGasketData;

  beforeEach(() => {
    getPublicGasketData = jest.fn(() => ({ some: 'data' }));
    gasket = {
      actions: {
        getPublicGasketData
      },
      config: {},
      execWaterfall: jest.fn((event, config) => Promise.resolve(config))
    };

    mockReq = { mock: 'request', cookies: { market: 'de-DE' } };
    mockRes = { mock: 'response', locals: {} };
  });

  it('sets a `locals.gasketData` property on the response object', async () => {
    const mockData = {  some: 'public data' };
    getPublicGasketData.mockReturnValue(mockData);
    const middlewareMock = promisify(middleware(gasket));

    await middlewareMock(mockReq, mockRes);

    expect(mockRes.locals).toHaveProperty('gasketData', mockData);
    expect(getPublicGasketData).toHaveBeenCalledWith(mockReq);
  });
});
