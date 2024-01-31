const configureMiddleware = require('../lib/middleware');

const customMakeStore = require('custom-make-store');

describe('Middleware', () => {
  let gasket;
  let results;

  beforeEach(() => {
    gasket = {
      config: {
        root: __dirname,
        redux: {
          makeStore: '../__mocks__/custom-make-store.js'
        }
      },
      exec: jest.fn(() => Promise.resolve()),
      execWaterfall: jest.fn((event, state) => Promise.resolve(state))
    };
  });

  describe('middlewareHook', () => {
    it('returns a function', () => {
      results = configureMiddleware(gasket);
      expect(results).toBeInstanceOf(Function);
    });
  });

  describe('instance', () => {
    let middleware, req, res, next;

    beforeEach(() => {
      middleware = configureMiddleware(gasket);
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

    it('will not invoke callback if headers are sent', async () => {
      res.headersSent = true;
      await middleware(req, res, next);
      expect(next).not.toHaveBeenCalled();
    });

    it('invokes makeStore', async () => {
      gasket.config.redux = { makeStore: '../__mocks__/custom-make-store.js' };

      middleware = configureMiddleware(gasket);
      await middleware(req, res, next);
      expect(customMakeStore).toHaveBeenCalled();
    });

    it('supports a custom initial store state', async () => {
      gasket.config.redux.initState = { foo: 'bar' };
      middleware = configureMiddleware(gasket);

      await middleware(req, res, next);

      expect(customMakeStore).toHaveBeenCalledWith({ foo: 'bar' }, { req });
    });

    it('supports plugin modification of initial store state', async () => {
      const initState = { foo: 'bar' };
      gasket.config.redux.initState = initState;
      gasket.execWaterfall = jest.fn((event, state) =>
        Promise.resolve({
          ...state,
          injected: 'prop'
        })
      );

      middleware = configureMiddleware(gasket);
      await middleware(req, res, next);

      expect(gasket.execWaterfall).toHaveBeenCalledWith(
        'initReduxState',
        initState,
        {
          req,
          res
        }
      );
      expect(customMakeStore).toHaveBeenCalledWith(
        { foo: 'bar', injected: 'prop' },
        { req }
      );
    });

    it('executes `initReduxStore` hooks after store creation', async () => {
      const mockStore = { mock: 'store' };
      customMakeStore.mockImplementation(() => mockStore);

      await middleware(req, res, next);

      expect(gasket.exec).toHaveBeenCalledWith('initReduxStore', mockStore, {
        req,
        res
      });
    });
  });
});
