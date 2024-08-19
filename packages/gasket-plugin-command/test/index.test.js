import plugin from '../lib/index.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { name, version, description } = require('../package.json');

describe('@gasket/plugin-command', () => {

  it('should export an object', () => {
    expect(plugin).toEqual(expect.any(Object));
  });

  it('should have properties', () => {
    expect(plugin).toHaveProperty('name', name);
    expect(plugin).toHaveProperty('version', version);
    expect(plugin).toHaveProperty('description', description);
    expect(plugin).toHaveProperty('hooks');
  });

  it('should have a ready hook', () => {
    expect(plugin.hooks.ready).toEqual(expect.any(Function));
  });

  it('should have expected hooks', () => {
    const expected = ['ready'];
    expect(Object.keys(plugin.hooks)).toEqual(expect.arrayContaining(expected));
  });
});
