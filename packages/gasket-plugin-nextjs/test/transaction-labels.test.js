const assume = require('assume');
const transactionLabels = require('../lib/transaction-labels');

describe('The transactionLabels hook', () => {
  it('returns the original labels if the route is not for a page', async () => {
    const req = { getNextRoute: async () => null };

    const labels = await transactionLabels({}, { original: 'labels' }, { req });

    assume(labels).deeply.equals({ original: 'labels' });
  });

  it('returns dynamic routes if the route is for a page', async () => {
    const req = {
      url: '/cohorts/Rad%20People',
      getNextRoute: async () => ({
        page: '/cohorts/[cohortId]',
        namedRegex: /^\/cohorts\/(?<cohortId>[^/]+)(?:\/)?$/
      })
    };

    const labels = await transactionLabels({}, { original: 'labels' }, { req });

    assume(labels).deeply.equals({
      cohortId: 'Rad People',
      original: 'labels'
    });
  });
});
