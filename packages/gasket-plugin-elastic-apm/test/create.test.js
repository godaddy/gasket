const plugin = require('../lib/index');
const { create } = plugin.hooks;

describe('create lifecycle', function () {

  it('plugin exposes a create lifecycle hook', () => {
    expect(typeof plugin.hooks).toStrictEqual('object');
    expect(typeof plugin.hooks.create).toStrictEqual('function');
  });

  it('adds the start script with --require', async () => {
    const add = jest.fn();
    await create({}, { pkg: { add }, files: { add } });
    expect(add).toHaveBeenCalledWith('scripts', {
      start: 'gasket start --require ./setup.js'
    });
  });

  it('adds expected dependencies', async () => {
    const add = jest.fn();
    await create({}, { pkg: { add }, files: { add } });
    expect(add).toHaveBeenCalledWith('dependencies', {
      'elastic-apm-node': require('../package.json').devDependencies['elastic-apm-node'],
      'dotenv': require('../package.json').devDependencies.dotenv
    });
  });
});
