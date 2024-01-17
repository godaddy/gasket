const plugin = require('../');

describe('Plugin', () => {

  it('is an object', () => {
    expect(typeof plugin).toEqual('object');
  });

  it('has expected name', () => {
    expect(plugin.name).toBe(require('../package').name);
  });

  it('has expected hooks', () => {
    const expected = [
      'create',
      'configure',
      'docsView',
      'metadata'
    ];
    expect(Object.keys(plugin.hooks)).toEqual(expected);
    expect(Object.keys(plugin.hooks)).toHaveLength(expected.length);
  });
});
