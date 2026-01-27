import plugin from '../lib/index.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { name, version, description } = require('../package.json');

describe('Plugin', function () {
  it('is an object', function () {
    expect(plugin).toBeInstanceOf(Object);
  });

  it('has expected properties', () => {
    expect(plugin).toHaveProperty('name', name);
    expect(plugin).toHaveProperty('version', version);
    expect(plugin).toHaveProperty('description', description);
    expect(plugin).toHaveProperty('actions');
    expect(plugin).toHaveProperty('hooks');
  });

  it('has expected hooks', function () {
    const expected = [
      'apmTransaction',
      'build',
      'configure',
      'publicGasketData',
      'init',
      'metadata',
      'serviceWorkerCacheKey'
    ];

    expect(plugin).toHaveProperty('hooks');

    const hooks = Object.keys(plugin.hooks);
    for (const hook of expected) {
      expect(hooks).toContain(hook);
    }
    expect(hooks).toHaveLength(expected.length);
  });
});
