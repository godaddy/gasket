const assume = require('assume');

describe('index', () => {
  it('exposes expected function', () => {
    const utils = require('../lib');

    const expected = [
      'tryRequire',
      'applyEnvironmentOverrides',
      'runShellCommand'
    ];

    assume(expected.every(k => k in utils)).true();
    assume(Object.keys(utils)).lengthOf(expected.length);
  });
});
