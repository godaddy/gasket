const plugin = require('../');
const assume = require('assume');

describe('Plugin', function () {

  it('is named correctly', function () {
    assume(plugin.name).equals('docs');
  });
});
