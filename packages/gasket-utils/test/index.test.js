describe('index', () => {
  it('exposes expected function', () => {
    const utils = require('../lib');

    const expected = [
      'applyConfigOverrides',
      'runShellCommand',
      'PackageManager',
      'warnIfOutdated'
    ];

    expect(expected.every(k => k in utils)).toBe(true);
    expect(Object.keys(utils)).toHaveLength(expected.length);
  });
});
