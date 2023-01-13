const plugin = require('../lib');

describe('Plugin', function () {
  it('is an object', function () {
    expect(plugin).toBeInstanceOf(Object);
  });

  it('has expected name', function () {
    expect(plugin).toHaveProperty('name', require('../package.json').name);
  });

  it('has expected hooks', function () {
    const expected = [
      'apmTransaction',
      'build',
      'configure',
      'create',
      'express',
      'fastify',
      'init',
      'metadata',
      'middleware',
      'serviceWorkerCacheKey',
      'webpackConfig',
      'workbox'
    ];

    expect(plugin).toHaveProperty('hooks');

    const hooks = Object.keys(plugin.hooks);
    for (const hook of expected) {
      expect(hooks).toContain(hook);
    }
    expect(hooks).toHaveLength(expected.length);
  });
});
