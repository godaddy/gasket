const create = require('../lib/create');
const { name, version } = require('../package.json');

describe('create', () => {

  it('adds the analyze script and adds the plugin', async () => {
    const add = jest.fn();
    const addEnvironment = jest.fn();
    await create({}, { pkg: { add }, gasketConfig: { addEnvironment } });
    expect(add.mock.calls[0]).toEqual(['devDependencies', {
      [name]: `^${version}`
    }]);
    expect(add.mock.calls[1]).toEqual(['scripts', {
      analyze: 'GASKET_ENV=local.analyze next build'
    }]);
    expect(addEnvironment).toHaveBeenCalledWith('local.analyze', {
      dynamicPlugins: [
        '@gasket/plugin-analyze'
      ]
    });
  });
});
