const { name, version, description } = require('../package.json');
const plugin = require('../lib/index.js');

describe('Plugin', () => {
  it('is an object', () => {
    expect(plugin).toBeInstanceOf(Object);
  });

  it('has expected properties', () => {
    expect(plugin).toHaveProperty('name', name);
    expect(plugin).toHaveProperty('version', version);
    expect(plugin).toHaveProperty('description', description);
  });

  it('has expected hooks', () => {
    const expected = ['create', 'createServers', 'metadata'];
    expect(Object.keys(plugin.hooks)).toEqual(expected);
  });
});
