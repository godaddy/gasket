import apmTransaction from '../lib/apm-transaction.js';

describe('The apmTransaction hook', () => {

  it('adds a locale label', async () => {
    const gasket = {
      actions: {
        getIntlLocale: vi.fn().mockResolvedValue('es-MX')
      }
    };

    const req = {};
    const transaction = { setLabel: vi.fn() };

    await apmTransaction(gasket, transaction, { req });

    expect(transaction.setLabel).toHaveBeenCalledWith('locale', 'es-MX');
  });
});
