const { promisify } = require('util');
const middlewareHook = require('../lib/middleware');

jest.mock('elastic-apm-node', () => ({
  isStarted: jest.fn().mockReturnValue(true),
  currentTransaction: {
    name: 'GET /cohorts/:cohortId',
    addLabels: jest.fn()
  }
}));

describe('The middleware hook', () => {
  let gasket, req, res, apm;

  beforeEach(() => {
    apm = require('elastic-apm-node');
    gasket = {
      exec: jest.fn(() => Promise.resolve())
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
    apm.isStarted = jest.fn().mockReturnValueOnce(false);
    const middleware = await middlewareHook(gasket);
    expect(middleware).toBeUndefined();
  });

  describe('middleware', () => {
    let middlewareFunc;

    beforeEach(async () => {
      apm.isStarted = jest.fn().mockReturnValue(true);
      middlewareFunc = await middlewareHook(gasket);
      middlewareFunc = promisify(middlewareFunc);
    });

    it('enables customization of transaction name and labels', async () => {
      await middlewareFunc(req, res);

      expect(gasket.exec).toHaveBeenCalledWith(
        'apmTransaction',
        apm.currentTransaction,
        { req }
      );
    });

    it('logs a warning if apm is not started', async () => {
      apm.isStarted = jest.fn().mockReturnValue(false);

      await middlewareFunc(req, res);
      expect(gasket.exec).not.toHaveBeenCalled();
    });

    it('returns if currentTransaction is not defined', async () => {
      apm.currentTransaction = null;
      await middlewareFunc(req, res);
      expect(gasket.exec).not.toHaveBeenCalled();
    });
  });
});
