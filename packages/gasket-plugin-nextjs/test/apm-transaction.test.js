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
      url: '/customer/123',
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

  it('handles URL segments that are not properly URL encoded', async () => {
    const req = {
      url: '/cohorts/TopTen%',
      getNextRoute: async () => ({
        page: '/cohorts/[cohortId]',
        namedRegex: /^\/cohorts\/(?<cohortId>[^/]+)(?:\/)?$/
      })
    };

    await apmTransaction({}, transaction, { req });

    expect(transaction.addLabels).toHaveBeenCalledWith({ cohortId: 'TopTen%' });
  });

  it('ignores the query string when parsing the route', async () => {
    const req = {
      url: '/cohorts/Rad%20People?utm_source=TDFS_DASLNC&utm_medium=parkedpages&utm_campaign=x_corp_tdfs-daslnc_base&traffic_type=TDFS_DASLNC&traffic_id=daslnc&sayfa=20&act=ul&listurun=12&sublastcat=&subcat=61&marka=&sort=2&catname=Realistik%20Belden%20Ba%F0lamal%FD',
      getNextRoute: async () => ({
        page: '/cohorts/[cohortId]',
        namedRegex: /^\/cohorts\/(?<cohortId>[^/]+)(?:\/)?$/
      })
    };

    await apmTransaction({}, transaction, { req });

    expect(transaction.addLabels).toHaveBeenCalledWith({ cohortId: 'Rad People' });
  });
});
