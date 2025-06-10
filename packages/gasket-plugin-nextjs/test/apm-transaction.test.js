const apmTransaction = require('../lib/apm-transaction');

describe('The apmTransaction hook', () => {
  let transaction, mockGasket;

  beforeEach(() => {
    transaction = {
      name: 'GET *',
      addLabels: jest.fn()
    };

    mockGasket = {
      actions: {
        getNextRoute: jest.fn()
      }
    };
  });

  it('retains the original name if the route is not for a page', async () => {
    transaction.name = 'GET /proxy/foo';
    await apmTransaction(mockGasket, transaction, { req: {} });
    expect(transaction.name).toEqual('GET /proxy/foo');
  });

  it('returns the page name if the route is for a page', async () => {
    mockGasket.actions.getNextRoute.mockResolvedValueOnce({
      page: '/customer/[id]',
      namedRegex: /^\/customer\/(?<id>[^/]+)(?:\/)?$/
    });
    const req = {
      path: '/customer/123'
    };

    await apmTransaction(mockGasket, transaction, { req });

    expect(transaction.name).toEqual('/customer/[id]');
  });

  it('does not set labels if the route is not for a page', async () => {
    await apmTransaction(mockGasket, transaction, { req: {} });

    expect(transaction.addLabels).not.toHaveBeenCalled();
  });

  it('sets dynamic route params as labels if the route is for a page', async () => {
    mockGasket.actions.getNextRoute.mockResolvedValueOnce({
      page: '/cohorts/[cohortId]',
      namedRegex: /^\/cohorts\/(?<cohortId>[^/]+)(?:\/)?$/
    });
    const req = {
      path: '/cohorts/Rad%20People'
    };

    await apmTransaction(mockGasket, transaction, { req });

    expect(transaction.addLabels).toHaveBeenCalledWith({ cohortId: 'Rad People' });
  });

  it('handles URL segments that are not properly URL encoded', async () => {
    mockGasket.actions.getNextRoute.mockResolvedValueOnce({
      page: '/cohorts/[cohortId]',
      namedRegex: /^\/cohorts\/(?<cohortId>[^/]+)(?:\/)?$/
    });
    const req = {
      path: '/cohorts/TopTen%'
    };

    await apmTransaction(mockGasket, transaction, { req });

    expect(transaction.addLabels).toHaveBeenCalledWith({ cohortId: 'TopTen%' });
  });

  it('ignores the query string when parsing the route', async () => {
    mockGasket.actions.getNextRoute.mockResolvedValueOnce({
      page: '/cohorts/[cohortId]',
      namedRegex: /^\/cohorts\/(?<cohortId>[^/]+)(?:\/)?$/
    });
    const req = {
      // path should never contain a query but this is a safety check
      // eslint-disable-next-line max-len
      path: '/cohorts/Rad%20People?utm_source=TDFS_DASLNC&utm_medium=parkedpages&utm_campaign=x_corp_tdfs-daslnc_base&traffic_type=TDFS_DASLNC&traffic_id=daslnc&sayfa=20&act=ul&listurun=12&sublastcat=&subcat=61&marka=&sort=2&catname=Realistik%20Belden%20Ba%F0lamal%FD'
    };

    await apmTransaction(mockGasket, transaction, { req });

    expect(transaction.addLabels).toHaveBeenCalledWith({ cohortId: 'Rad People' });
  });
});
