import plugin from '../lib/index.js';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const packageJson = require('../package.json');
const { name, version, description } = packageJson;

describe('Plugin', function () {

  it('is an object', () => {
    expect(plugin).toBeInstanceOf(Object);
  });

  it('has expected properties', () => {
    expect(plugin).toHaveProperty('name', name);
    expect(plugin).toHaveProperty('version', version);
    expect(plugin).toHaveProperty('description', description);
  });
  it('has expected hooks', () => {
    const expected = [
      'configure',
      'commands',
      'metadata',
      'docsSetup',
      'webpackConfig'
    ];

    expect(plugin).toHaveProperty('hooks');

    const hooks = Object.keys(plugin.hooks);
    expect(hooks).toEqual(expected);
    expect(hooks.length).toBe(expected.length);
  });
});
