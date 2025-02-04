const configureMiddleware = require('../lib/middleware');

const customMakeStore = require('custom-make-store');

describe('Middleware', () => {
  let gasket;
  let results;
  let initStateCb, initStoreCb;

  beforeEach(() => {
    gasket = {
      logger: {
        warn: jest.fn()
      },
      config: {
        root: __dirname,
        redux: {
          makeStore: '../__mocks__/custom-make-store.js'
        }
      },
      execApply: jest.fn().mockImplementation((name, callback) => {
        if (name === 'initReduxState') {
          initStateCb = callback;
          return Promise.resolve({});
        } else if (name === 'initReduxStore') {
          initStoreCb = callback;
        }
      })
    };
  });

  describe('middlewareHook', () => {
    it('returns a function', async () => {
      results = await configureMiddleware(gasket);
      expect(results).toBeInstanceOf(Function);
    });
  });

  describe('instance', () => {
    let middleware, req, res, next;

    beforeEach(async () => {
      middleware = await configureMiddleware(gasket);
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

      middleware = await configureMiddleware(gasket);
      await middleware(req, res, next);
      expect(customMakeStore).toHaveBeenCalled();
    });

    it('passes the gasket logger by default', async () => {
      gasket.config.redux = { makeStore: '../__mocks__/custom-make-store.js' };
      gasket.logger = { info: jest.fn() };

      middleware = await configureMiddleware(gasket);
      await middleware(req, res, next);

      expect(customMakeStore).toHaveBeenCalledWith(expect.any(Object), expect.objectContaining({
        logger: gasket.logger
      }));
    });

    it('supports a custom initial store state', async () => {
      gasket.config.redux.initState = { foo: 'bar' };
      middleware = await configureMiddleware(gasket);

      await middleware(req, res, next);

      expect(customMakeStore).toHaveBeenCalledWith({ foo: 'bar' }, { logger: { warn: expect.any(Function) }, req });
    });

    it('supports plugin modification of initial store state', async () => {
      const initState = { foo: 'bar' };
      gasket.config.redux.initState = initState;

      middleware = await configureMiddleware(gasket);
      await middleware(req, res, next);

      expect(gasket.execApply).toHaveBeenCalledWith(
        'initReduxState',
        expect.any(Function)
      );

      const handler = jest.fn().mockImplementation((state) => {
        return Promise.resolve({ ...state, injected: 'prop' });
      });

      await initStateCb({ name: 'mock-plugin' }, handler);

      expect(handler).toHaveBeenCalledWith(initState, { req, res });
      expect(gasket.logger.warn).toHaveBeenCalledWith(expect.stringMatching(/DEPRECATED `initReduxState` lifecycle/));
    });

    it('executes `initReduxStore` hooks after store creation', async () => {
      const mockStore = { mock: 'store' };
      customMakeStore.mockImplementation(() => mockStore);

      middleware = await configureMiddleware(gasket);
      await middleware(req, res, next);

      expect(gasket.execApply).toHaveBeenCalledWith(
        'initReduxStore',
        expect.any(Function)
      );

      const handler = jest.fn().mockImplementation((store) => {
        return Promise.resolve(store);
      });

      await initStoreCb({ name: 'mock-plugin' }, handler);

      expect(handler).toHaveBeenCalledWith(mockStore, { req, res });
      expect(gasket.logger.warn).toHaveBeenCalledWith(expect.stringMatching(/DEPRECATED `initReduxStore` lifecycle/));
    });
  });
});
