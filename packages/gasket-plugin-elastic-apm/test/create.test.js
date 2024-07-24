const create = require('../lib/create');

describe('create lifecycle', function () {

  it('is a function', () => {
    expect(typeof create).toStrictEqual('function');
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
