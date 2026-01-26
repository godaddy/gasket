import plugin from '../lib/index.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pkgJson = require('../package.json');
const { name, version } = pkgJson;

describe('Plugin', () => {

  it('is an object', () => {
    expect(typeof plugin).toEqual('object');
  });

  it('has expected properties', () => {
    expect(plugin).toHaveProperty('name', name);
    expect(plugin).toHaveProperty('version', version);
  });

  it('has expected hooks', () => {
    const expected = [
      'prepare',
      'metadata'
    ];
    expect(Object.keys(plugin.hooks)).toEqual(expected);
    expect(Object.keys(plugin.hooks)).toHaveLength(expected.length);
  });
});


