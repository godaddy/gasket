import Gasket from '@gasket/engine';

describe('@gasket/engine', () => {
  it('exposes the constructor interface', () => {
    // eslint-disable no-new
    new Gasket(
      { root: __dirname, env: 'test' },
      { resolveFrom: __dirname }
    );
  });
});
