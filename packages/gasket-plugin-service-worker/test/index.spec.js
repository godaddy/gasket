const plugin = require('../lib');

describe('Plugin', () => {

  it('is an object', () => {
    expect(plugin).toBeInstanceOf(Object);
  });

  it('has expected name', () => {
    expect(plugin).toHaveProperty('name', require('../package').name);
  });

  it('has expected hooks', () => {
    const expected = [
      'configure',
      'build',
      'middleware',
      'express',
      'webpack',
      'metadata'
    ];

    expect(plugin).toHaveProperty('hooks');

    const hooks = Object.keys(plugin.hooks);
    expect(hooks).toEqual(expected);
    expect(hooks).toHaveLength(expected.length);
  });

  describe('meta', function () {
    it('returns lifecycle metadata', function () {
      const results = plugin.hooks.metadata({}, {});
      expect(results).toEqual(expect.objectContaining({
        lifecycles: expect.any(Array)
      }));
    });
  });
});
