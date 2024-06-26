const apmTransaction = require('../lib/apm-transaction');

describe('The apmTransaction hook', () => {
  it('adds a locale label', async () => {
    const transaction = { setLabel: jest.fn() };

    await apmTransaction(
      {
        actions: {
          getPublicGasketData: jest.fn().mockResolvedValue({ intl: { locale: 'es-MX' } })
        }
      },
      transaction,
      {
        req: {}
      }
    );

    expect(transaction.setLabel).toHaveBeenCalledWith('locale', 'es-MX');
  });
});
