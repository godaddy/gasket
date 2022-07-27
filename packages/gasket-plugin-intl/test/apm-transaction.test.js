const assume = require('assume');
const { spy } = require('sinon');
const apmTransaction = require('../lib/apm-transaction');

describe('The apmTransaction hook', () => {
  it('adds a locale label', async () => {
    const res = {
      locals: {
        gasketData: {
          locale: 'es-MX'
        }
      }
    };
    const transaction = { setLabel: spy() };

    apmTransaction({}, transaction, { res });

    assume(transaction.setLabel).was.calledWith('locale', 'es-MX');
  });
});
