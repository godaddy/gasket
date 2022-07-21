const transactionLabels = require('../lib/transaction-labels');
const assume = require('assume');

describe('The transactionLabels hook', () => {
  it('adds a locale label', async () => {
    const res = {
      locals: {
        gasketData: {
          locale: 'es-MX'
        }
      }
    };

    const newLabels = await transactionLabels({}, { some: 'label' }, { res });

    assume(newLabels).deeply.equals({
      some: 'label',
      locale: 'es-MX'
    });
  });
});
