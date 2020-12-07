const assume = require('assume');

const plugin = require('../lib');

describe('Plugin', function () {

  it('is an object', function () {
    assume(plugin).is.an('object');
  });

  it('has expected name', function () {
    assume(plugin).to.have.property('name', require('../package').name);
  });

  it('has expected hooks', function () {
    const expected = [
      'build',
      'configure',
      'express',
      'middleware',
      'metadata'
    ];

    assume(plugin).to.have.property('hooks');

    const hooks = Object.keys(plugin.hooks);
    assume(hooks).eqls(expected);
    assume(hooks).is.length(expected.length);
  });

  describe('meta', function () {
    it('returns lifecycle metadata', function () {
      const results = plugin.hooks.metadata({}, {});
      assume(results.lifecycles).is.an('array');
    });
  });
});
