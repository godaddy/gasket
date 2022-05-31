const assume = require('assume');
const plugin = require('../lib');

describe('Plugin', function () {
  it('is an object', function () {
    assume(plugin).instanceOf(Object);
  });

  it('has expected name', function () {
    assume(plugin).property('name', require('../package.json').name);
  });

  it('has expected hooks', function () {
    const expected = [
      'init',
      'configure',
      'create',
      'build',
      'webpackConfig',
      'express',
      'fastify',
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
