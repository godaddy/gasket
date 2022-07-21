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
      'build',
      'configure',
      'create',
      'express',
      'fastify',
      'init',
      'metadata',
      'middleware',
      'serviceWorkerCacheKey',
      'transactionLabels',
      'webpackConfig',
      'workbox'
    ];

    assume(plugin).property('hooks');

    const hooks = Object.keys(plugin.hooks);
    for (const hook of expected) {
      assume(hooks).contains(hook);
    }
    assume(hooks).length(expected.length);
  });
});
