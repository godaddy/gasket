import plugin from '../lib/index.js';
import packageJson from '../package.json' with { type: 'json' };
const { name, version, description } = packageJson;

describe('Plugin', function () {
  it('is an object', function () {
    expect(typeof plugin).toBe('object');
  });

  it('has expected properties', () => {
    expect(plugin).toHaveProperty('name', name);
    expect(plugin).toHaveProperty('version', version);
    expect(plugin).toHaveProperty('description', description);
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
