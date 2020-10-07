const assume = require('assume');
const plugin = require('../lib');

describe('Plugin', () => {

  it('is an object', () => {
    assume(plugin).instanceOf(Object);
  });

  it('has expected name', () => {
    assume(plugin).property('name', require('../package.json').name);
  });

  it('has expected hooks', () => {
    const expected = [
      'init',
      'configure',
      'create',
      'build',
      'webpack',
      'middleware',
      'workbox',
      'serviceWorkerCacheKey',
      'metadata'
    ];

    assume(plugin).property('hooks');

    const hooks = Object.keys(plugin.hooks);
    assume(hooks).eqls(expected);
    assume(hooks).length(expected.length);
  });
});
