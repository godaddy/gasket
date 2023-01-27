describe('index', () => {
  it('exposes expected function', () => {
    const utils = require('../lib');

    const expected = [
      'tryRequire',
      'tryResolve',
      'applyConfigOverrides',
      'applyEnvironmentOverrides',
      'runShellCommand',
      'PackageManager',
      'requireWithInstall'
    ];

    expect(expected.every(k => k in utils)).toBe(true);
    expect(Object.keys(utils)).toHaveLength(expected.length);
  });
});
