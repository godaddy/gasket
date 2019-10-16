const plugin = require('../');
const assume = require('assume');

describe('Plugin', function () {

  it('is an object', () => {
    assume(plugin).is.an('object');
  });

  it('is named correctly', function () {
    assume(plugin.name).equals('docs');
  });

  it('has expected hooks', () => {
    const expected = [
      'configure',
      'getCommands',
      'metadata',
      'docsSetup'
    ];

    assume(plugin).to.have.property('hooks');

    const hooks = Object.keys(plugin.hooks);
    assume(hooks).eqls(expected);
    assume(hooks).is.length(expected.length);
  });
});
