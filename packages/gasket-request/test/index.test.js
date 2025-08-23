

const module  = await import('../lib/index.js');

describe('index', () => {
  it('has expected exports', () => {
    const expected = [
      'GasketRequest',
      'makeGasketRequest',
      'withGasketRequest',
      'withGasketRequestCache',
      'WeakPromiseKeeper'
    ];

    expected.forEach(property => {
      expect(module).toHaveProperty(property);
    });
    expect(Object.keys(module)).toHaveLength(expected.length);
  });
});
