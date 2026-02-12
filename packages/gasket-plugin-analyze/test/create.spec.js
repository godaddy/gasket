import create from '../lib/create.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { name, version } = require('../package.json');

describe('create', () => {

  it('adds the analyze script and adds the plugin', async () => {
    const add = vi.fn();
    const addEnvironment = vi.fn();
    await create({}, { pkg: { add }, gasketConfig: { addEnvironment } });
    expect(add.mock.calls[0]).toEqual(['devDependencies', {
      [name]: `^${version}`
    }]);
    expect(add.mock.calls[1]).toEqual(['scripts', {
      analyze: 'GASKET_ENV=local.analyze next build --webpack'
    }]);
    expect(addEnvironment).toHaveBeenCalledWith('local.analyze', {
      dynamicPlugins: [
        '@gasket/plugin-analyze'
      ]
    });
  });
});
