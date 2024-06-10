/* eslint-disable max-statements */
const plugin = require('../');
const { name, version, description } = require('../package');

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
  });

  it('has expected hooks', () => {
    const expected = [
      'create',
      'actions',
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
