const configureMiddleware = require('./middleware');

const mockMakeStore = require('@gasket/redux/make-store');
const customMakeStore = require('custom-make-store');

describe('Middleware', () => {
  let gasket;
  let results;

  beforeEach(() => {
    gasket = {
      config: {
        root: __dirname
      },
      exec: jest.fn(() => Promise.resolve()),
      execWaterfall: jest.fn((event, state) => Promise.resolve(state))
    };
  });

  describe('configureMiddleware', () => {

    it('returns a function', () => {
      results = configureMiddleware(gasket);
      expect(results).toBeInstanceOf(Function);
    });
  });

  describe('instance', () => {
    let middleware, req, res, next;

    beforeEach(() => {
      middleware = configureMiddleware(gasket);
      mockMakeStore.mockClear();
      customMakeStore.mockClear();
      res = {};
      req = {};
      next = jest.fn();
    });

    it('attaches store to req', async () => {
      await middleware(req, res, next);
      expect(req).toHaveProperty('store', expect.any(Object));
    });

    it('invokes callback', async () => {
      await middleware(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('invokes base makeStore', async () => {
      await middleware(req, res, next);
      expect(mockMakeStore).toHaveBeenCalled();
    });

    it('invokes custom makeStore', async () => {
      gasket.config.redux = { makeStore: '../__mocks__/custom-make-store.js' };

      middleware = configureMiddleware(gasket);
      await middleware(req, res, next);
      expect(mockMakeStore).not.toHaveBeenCalled();
      expect(customMakeStore).toHaveBeenCalled();
    });

    it('supports a custom initial store state', async () => {
      gasket.config.redux = {
        initState: { foo: 'bar' }
      };
      middleware = configureMiddleware(gasket);

      await middleware(req, res, next);

      expect(mockMakeStore).toHaveBeenCalledWith({ foo: 'bar' }, { req });
    });

    it('supports plugin modification of initial store state', async () => {
      const initState = { foo: 'bar' };
      gasket.config.redux = { initState };
      gasket.execWaterfall = jest.fn((event, state) => Promise.resolve({
        ...state,
        injected: 'prop'
      }));

      middleware = configureMiddleware(gasket);
      await middleware(req, res, next);

      expect(gasket.execWaterfall)
        .toHaveBeenCalledWith('initReduxState', initState, req, res);
      expect(mockMakeStore)
        .toHaveBeenCalledWith({ foo: 'bar', injected: 'prop' }, { req });
    });

    it('executes `initReduxStore` hooks after store creation', async () => {
      const mockStore = { mock: 'store' };
      mockMakeStore.mockImplementation(() => mockStore);

      await middleware(req, res, next);

      expect(gasket.exec)
        .toHaveBeenCalledWith('initReduxStore', mockStore, req, res);
    });
  });
});
