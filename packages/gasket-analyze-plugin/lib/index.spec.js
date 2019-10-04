const plugin = require('./index');

describe('Plugin', () => {

  it('is an object', () => {
    expect(plugin).toBeInstanceOf(Object);
  });

  it('has hooks', () => {
    expect(plugin).toHaveProperty('hooks');
    expect(plugin.hooks).toBeInstanceOf(Object);
  });
});
