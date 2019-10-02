const plugin = require('../');
const assume = require('assume');

describe('Plugin', function () {

  it('is named correctly', function () {
    assume(plugin.name).equals('docsify');
  });

  it('has expected hooks', () => {
    const expected = [
      'docsView'
    ];
    assume(plugin).to.have.property('hooks');

    const hooks = Object.keys(plugin.hooks);
    assume(hooks).eqls(expected);
    assume(hooks).is.length(expected.length);
  });
});
