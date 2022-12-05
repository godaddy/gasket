const assume = require('assume');
const path = require('path');
const { tryResolve } = require('../lib/try-resolve');

describe('tryResolve', () => {

  it('loads an existing module', () => {
    const results = tryResolve(
      path.join(__dirname, 'fixtures/config.local'),
      { paths: [__dirname] }
    );
    assume(results).eqls(`${__dirname}/fixtures/config.local.js`);
  });

  it('returns null when module not found', () => {
    const results = tryResolve(
      path.join(__dirname, 'fixtures', 'missing'),
      { paths: [__dirname] }
    );
    assume(results).eqls(null);
  });
});
