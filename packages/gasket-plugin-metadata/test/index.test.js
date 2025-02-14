/* eslint-disable max-statements */
import plugin from '../lib/index.js';
import pkg from '../package.json' with { type: 'json' };
const { name, version, description } = pkg;

describe('Plugin', function () {
  let gasket;

  beforeEach(function () {
    gasket = {
      config: {
        root: process.cwd()
      }
    };
  });

  it('is an object', () => {
    expect(typeof plugin).toBe('object');
  });

  it('has expected properties', () => {
    expect(plugin).toHaveProperty('name', name);
    expect(plugin).toHaveProperty('version', version);
    expect(plugin).toHaveProperty('description', description);
    expect(plugin).toHaveProperty('actions');
    expect(plugin).toHaveProperty('hooks');
  });

  it('has expected hooks', () => {
    const expected = [
      'create',
      'webpackConfig',
      'metadata'
    ];

    expect(plugin).toHaveProperty('hooks');

    const hooks = Object.keys(plugin.hooks);
    expect(hooks).toEqual(expected);
    expect(hooks).toHaveLength(expected.length);
  });

  describe('metadata', () => {

    it('retains acquired plugin data', () => {
      const mockData = { name: '@gasket/plugin-mock' };
      const results = plugin.hooks.metadata(gasket, mockData);
      expect(results).toHaveProperty('name', '@gasket/plugin-mock');
    });

    it('adds lifecycles', () => {
      const mockData = { name: '@gasket/plugin-mock' };
      const results = plugin.hooks.metadata(gasket, mockData);
      expect(results).toHaveProperty('lifecycles');
    });
  });
});
