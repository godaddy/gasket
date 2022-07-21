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
      execWaterfall: jest.fn(async (name, value) => value)
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
      gasket.execWaterfall = jest.fn(async (lifecycle, current, context) => {
        expect(context).toHaveProperty('req', req);
        expect(context).toHaveProperty('res', res);

        if (lifecycle === 'transactionName') {
          return 'custom name';
        } else if (lifecycle === 'transactionLabels') {
          return { different: 'labels' };
        }

        return current;
      });

      await middleware(req, res);

      expect(apm.currentTransaction)
        .toHaveProperty('name', 'custom name');
      expect(apm.currentTransaction.addLabels)
        .toBeCalledWith({ different: 'labels' });
    });
  });
});
