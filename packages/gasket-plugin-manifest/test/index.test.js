const plugin = require('../lib');

describe('Plugin', function () {
  it('is an object', function () {
    expect(typeof plugin).toBe('object');
  });

  it('has expected name', function () {
    expect(plugin).toHaveProperty('name', require('../package').name);
  });

  it('has expected hooks', function () {
    const expected = [
      'build',
      'configure',
      'express',
      'fastify',
      'middleware',
      'metadata'
    ];

    expect(plugin).toHaveProperty('hooks');

    const hooks = Object.keys(plugin.hooks);
    expect(hooks).toEqual(expected);
    expect(hooks).toHaveLength(expected.length);
  });

  describe('meta', function () {
    it('returns lifecycle metadata', function () {
      const results = plugin.hooks.metadata({}, {});
      expect(Array.isArray(results.lifecycles)).toBe(true);
    });
  });
});
