const plugin = require('../lib');

describe('Plugin', () => {
  it('is an object', () => {
    expect(plugin).toBeInstanceOf(Object);
  });

  it('has expected hooks', () => {
    expect(plugin).toHaveProperty('hooks');
    expect(plugin.hooks).toBeInstanceOf(Object);
    expect(plugin.hooks).toEqual({
      'configure': expect.any(Function),
      'middleware': expect.any(Function),
      'express': expect.any(Function)
    });
  });
});
