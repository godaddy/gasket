const { promisify } = require('util');
const apm = require('elastic-apm-node');
const middlewareHook = require('../lib/middleware');

jest.mock('elastic-apm-node', () => ({
  currentTransaction: {
    name: 'transaction name',
    addLabels: jest.fn()
  }
}));

describe('The middleware hook', () => {
  let gasket, req, res;

  beforeEach(() => {
    gasket = {
      exec: jest.fn()
    };
    req = {
      url: '/cohorts/Rad%20Dudes'
    };
    res = {};
  });

  describe('middleware', () => {
    let middleware;

    beforeEach(async () => {
      [middleware] = await middlewareHook(gasket);
      middleware = promisify(middleware);
    });

    it('enables customization of transaction name and labels', async () => {
      await middleware(req, res);

      expect(gasket.exec).toBeCalledWith(
        'apmTransaction',
        apm.currentTransaction,
        { req, res }
      );
    });
  });
});
