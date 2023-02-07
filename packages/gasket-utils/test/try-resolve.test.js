const path = require('path');
const { tryResolve } = require('../lib/try-resolve');

describe('tryResolve', () => {

  it('loads an existing module', () => {
    const results = tryResolve(
      path.join(__dirname, 'fixtures/config.local'),
      { paths: [__dirname] }
    );
    expect(results).toEqual(`${__dirname}/fixtures/config.local.js`);
  });

  it('returns null when module not found', () => {
    const results = tryResolve(
      path.join(__dirname, 'fixtures', 'missing'),
      { paths: [__dirname] }
    );
    expect(results).toEqual(null);
  });
});
