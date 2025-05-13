const apmTransaction = require('../lib/apm-transaction');

describe('The apmTransaction hook', () => {

  it('adds a locale label', async () => {
    const gasket = {
      actions: {
        getIntlLocale: jest.fn().mockResolvedValue('es-MX')
      }
    };

    const req = {};
    const transaction = { setLabel: jest.fn() };

    await apmTransaction(gasket, transaction, { req });

    expect(transaction.setLabel).toHaveBeenCalledWith('locale', 'es-MX');
  });
});
