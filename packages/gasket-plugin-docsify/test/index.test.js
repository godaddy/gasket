const plugin = require('../');

describe('Plugin', function () {

  it('is an object', () => {
    expect(plugin).toEqual(expect.any(Object));
  });

  it('has expected name', () => {
    expect(plugin).toHaveProperty('name', require('../package').name);
  });

  it('has expected hooks', () => {
    const expected = [
      'create',
      'docsView',
      'metadata'
    ];
    expect(plugin).toHaveProperty('hooks');

    const hooks = Object.keys(plugin.hooks);
    expect(hooks).toEqual(expected);
    expect(hooks).toHaveLength(expected.length);
  });
});
