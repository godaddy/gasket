const plugin = require('../lib');
const { name, version, description } = require('../package');

describe('Plugin', () => {
  it('is an object', () => {
    expect(plugin).toBeInstanceOf(Object);
  });

  it('has expected properties', () => {
    expect(plugin).toHaveProperty('name', name);
    expect(plugin).toHaveProperty('version', version);
    expect(plugin).toHaveProperty('description', description);
    expect(plugin).toHaveProperty('actions', expect.any(Object));
  });

  it('has expected hooks', () => {
    const expected = [
      'configure',
      'build',
      'express',
      'fastify',
      'webpackConfig',
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
      expect(results).toEqual(
        expect.objectContaining({
          lifecycles: expect.any(Array)
        })
      );
    });
  });
});
