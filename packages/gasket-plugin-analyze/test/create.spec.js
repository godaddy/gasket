const create = require('../lib/create');
const { name, version } = require('../package.json');

describe('create', () => {

  it('adds the analyze script and adds the plugin', async () => {
    const add = jest.fn();
    const addPlugin = jest.fn();
    await create({}, { pkg: { add }, gasketConfig: { addPlugin } });
    expect(add.mock.calls[0]).toEqual(['devDependencies', {
      [name]: `^${version}`
    }]);
    expect(add.mock.calls[1]).toEqual(['scripts', {
      analyze: 'ANALYZE=true next build'
    }]);
    expect(addPlugin.mock.calls[0]).toEqual(['pluginAnalyze', name]);
  });
});
