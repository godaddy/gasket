import plugin from '../lib/index.js';

describe('@gasket/plugin-command', () => {

  it('should export an object', () => {
    expect(plugin).toEqual(expect.any(Object));
  });

  it('should have a name', () => {
    expect(plugin.name).toEqual('@gasket/plugin-command');
  });

  it('should have a configure hook', () => {
    expect(plugin.hooks.configure).toEqual(expect.any(Function));
  });

  it('should have expected hooks', () => {
    const expected = ['configure'];
    expect(Object.keys(plugin.hooks)).toEqual(expect.arrayContaining(expected));
  });
});
