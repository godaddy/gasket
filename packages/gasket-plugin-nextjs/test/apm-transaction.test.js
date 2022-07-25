const assume = require('assume');
const { spy } = require('sinon');
const apmTransaction = require('../lib/apm-transaction');

describe('The apmTransaction hook', () => {
  let transaction;

  beforeEach(() => {
    transaction = {
      name: 'GET *',
      addLabels: spy()
    };
  });

  it('retains the original name if the route is not for a page', async () => {
    transaction.name = 'GET /proxy/foo';
    const req = { getNextRoute: async () => null };

    await apmTransaction({}, transaction, { req });

    assume(transaction.name).equals('GET /proxy/foo');
  });

  it('returns the page name if the route is for a page', async () => {
    const req = {
      getNextRoute: async () => ({
        page: '/customer/[id]',
        namedRegex: /^\/customer\/(?<id>[^/]+)(?:\/)?$/
      })
    };

    await apmTransaction({}, transaction, { req });

    assume(transaction.name).equals('/customer/[id]');
  });

  it('does not set labels if the route is not for a page', async () => {
    const req = { getNextRoute: async () => null };

    await apmTransaction({}, transaction, { req });

    assume(transaction.addLabels).was.not.called();
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

    assume(transaction.addLabels).was.calledWith({ cohortId: 'Rad People' });
  });
});
