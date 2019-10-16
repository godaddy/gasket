const plugin = require('../lib');

describe('Plugin', () => {
  it('is an object', () => {
    expect(plugin).toBeInstanceOf(Object);
  });

  it('has expected name', () => {
    expect(plugin).toHaveProperty('name', 'workbox');
  });

  it('has expected hooks', () => {
    const expected = [
      'configure',
      'build',
      'express',
      'composeServiceWorker'
    ];

    expect(plugin).toHaveProperty('hooks');

    const hooks = Object.keys(plugin.hooks);
    expect(hooks).toEqual(expected);
    expect(hooks).toHaveLength(expected.length);
  });
});
