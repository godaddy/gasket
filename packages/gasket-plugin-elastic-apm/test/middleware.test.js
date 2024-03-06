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

  describe('middleware', () => {
    let middleware;

    beforeEach(async () => {
      [middleware] = middlewareHook(gasket);
      middleware = promisify(middleware);
    });

    it('enables customization of transaction name and labels', async () => {
      await middleware(req, res);

      expect(gasket.exec).toHaveBeenCalledWith(
        'apmTransaction',
        gasket.apm.currentTransaction,
        { req, res }
      );
    });

    it('logs a warning if apm is not started', async () => {
      gasket.apm.isStarted = jest.fn().mockReturnValue(false);

      await middleware(req, res);
      expect(gasket.exec).not.toHaveBeenCalled();
    });

    it('returns if currentTransaction is not defined', async () => {
      gasket.apm.currentTransaction = null;
      await middleware(req, res);
      expect(gasket.exec).not.toHaveBeenCalled();
    });
  });
});
