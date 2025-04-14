import plugin from '../lib/index.js';
import pkg from '../package.json';
const { name, version } = pkg;

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
      'create',
      'prepare',
      'metadata'
    ];
    expect(Object.keys(plugin.hooks)).toEqual(expected);
    expect(Object.keys(plugin.hooks)).toHaveLength(expected.length);
  });
});


