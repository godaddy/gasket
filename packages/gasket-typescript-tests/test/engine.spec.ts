import Gasket from '@gasket/engine';

describe('@gasket/engine', () => {
  it('exposes the constructor interface', () => {
    new Gasket(
      { root: __dirname, env: 'test', command: { id: 'start' } },
      { resolveFrom: __dirname }
    );
  });
});
