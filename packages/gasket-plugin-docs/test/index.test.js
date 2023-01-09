const plugin = require('../');

describe('Plugin', function () {

  it('is an object', () => {
    expect(plugin).toBeInstanceOf(Object);
  });

  it('has expected name', () => {
    expect(plugin).toHaveProperty('name', require('../package').name);
  });

  it('has expected hooks', () => {
    const expected = [
      'configure',
      'getCommands',
      'metadata',
      'docsSetup'
    ];

    expect(plugin).toHaveProperty('hooks');

    const hooks = Object.keys(plugin.hooks);
    expect(hooks).toEqual(expected);
    expect(hooks.length).toBe(expected.length);
  });
});
