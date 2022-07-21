const assume = require('assume');
const transactionName = require('../lib/transaction-name');

describe('The transactionName hook', () => {
  it('returns the original name if the route is not for a page', async () => {
    const req = { getNextRoute: async () => null };

    const name = await transactionName({}, '/proxy/foo', { req });

    assume(name).equals('/proxy/foo');
  });

  it('returns the page name if the route is for a page', async () => {
    const req = { getNextRoute: async () => ({ page: '/customer/[id]' }) };

    const name = await transactionName({}, '/proxy/foo', { req });

    assume(name).equals('/customer/[id]');
  });
});
