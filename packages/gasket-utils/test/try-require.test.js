const path = require('path');
const tryRequire = require('../lib/try-require');

describe('tryRequire', () => {

  it('loads an existing module', () => {
    const results = tryRequire(
      path.join(__dirname, 'fixtures', 'config.local'));
    expect(results).toEqual({
      localsOnly: true
    });
  });

  it('returns null when module not found', () => {
    const results = tryRequire(path.join(__dirname, 'fixtures', 'missing'));
    expect(results).toEqual(null);
  });

  it('throws for other errors', () => {
    expect(() => tryRequire(path.join(__dirname, 'fixtures', 'bad-file'))).
      toThrow();
  });
});
