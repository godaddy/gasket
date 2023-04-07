const apmTransaction = require('../lib/apm-transaction');

describe('The apmTransaction hook', () => {
  let transaction;

  beforeEach(() => {
    transaction = {
      name: 'GET *',
      addLabels: jest.fn()
    };
  });

  it('retains the original name if the route is not for a page', async () => {
    transaction.name = 'GET /proxy/foo';
    const req = { getNextRoute: async () => null };

    await apmTransaction({}, transaction, { req });

    expect(transaction.name).toEqual('GET /proxy/foo');
  });

  it('returns the page name if the route is for a page', async () => {
    const req = {
      getNextRoute: async () => ({
        page: '/customer/[id]',
        namedRegex: /^\/customer\/(?<id>[^/]+)(?:\/)?$/
      })
    };

    await apmTransaction({}, transaction, { req });

    expect(transaction.name).toEqual('/customer/[id]');
  });

  it('does not set labels if the route is not for a page', async () => {
    const req = { getNextRoute: async () => null };

    await apmTransaction({}, transaction, { req });

    expect(transaction.addLabels).not.toHaveBeenCalled();
  });

  it('sets dynamic route params as labels if the route is for a page', async () => {
    const req = {
      url: '/cohorts/Rad%20People',
      getNextRoute: async () => ({
        page: '/cohorts/[cohortId]',
        namedRegex: /^\/cohorts\/(?<cohortId>[^/]+)(?:\/)?$/
      })
    };

    await apmTransaction({}, transaction, { req });

    expect(transaction.addLabels).toHaveBeenCalledWith({ cohortId: 'Rad People' });
  });
});
