const assume = require('assume');
const path = require('path');
const tryRequire = require('../lib/try-require');

describe('tryRequire', () => {

  it('loads an existing module', () => {
    const results = tryRequire(
      path.join(__dirname, 'fixtures', 'config.local'));
    assume(results).eqls({
      localsOnly: true
    });
  });

  it('returns null when module not found', () => {
    const results = tryRequire(path.join(__dirname, 'fixtures', 'missing'));
    assume(results).eqls(null);
  });

  it('throws for other errors', () => {
    assume(() => tryRequire(path.join(__dirname, 'fixtures', 'bad-file'))).throws();
  });
});
