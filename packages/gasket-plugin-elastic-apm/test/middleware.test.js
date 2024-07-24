const { promisify } = require('util');
const middlewareHook = require('../lib/middleware');

describe('The middleware hook', () => {
  let gasket, req, res;

  beforeEach(() => {
    gasket = {
      exec: jest.fn(() => Promise.resolve()),
      apm: {
        isStarted: jest.fn().mockReturnValue(true),
        currentTransaction: {
          name: 'transaction name',
          addLabels: jest.fn()
        }
      }
    };
    req = {
      url: '/cohorts/Rad%20Dudes'
    };
    res = {};
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('does not include the middleware if apm is not started', async () => {
    delete gasket.apm;

    const middleware = await middlewareHook(gasket);

    expect(middleware).toBeUndefined();
  });

  describe('middleware', () => {
    let middlewareFunc;

    beforeEach(async () => {
      middlewareFunc = await middlewareHook(gasket);
      middlewareFunc = promisify(middlewareFunc);
    });

    it('enables customization of transaction name and labels', async () => {
      await middlewareFunc(req, res);

      expect(gasket.exec).toHaveBeenCalledWith(
        'apmTransaction',
        gasket.apm.currentTransaction,
        { req }
      );
    });

    it('logs a warning if apm is not started', async () => {
      gasket.apm.isStarted = jest.fn().mockReturnValue(false);

      await middlewareFunc(req, res);
      expect(gasket.exec).not.toHaveBeenCalled();
    });

    it('returns if currentTransaction is not defined', async () => {
      gasket.apm.currentTransaction = null;
      await middlewareFunc(req, res);
      expect(gasket.exec).not.toHaveBeenCalled();
    });
  });
});
