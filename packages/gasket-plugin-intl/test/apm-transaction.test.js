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
    const transaction = { setLabel: jest.fn() };

    apmTransaction({}, transaction, { res });

    expect(transaction.setLabel).toHaveBeenCalledWith('locale', 'es-MX');
  });
});
