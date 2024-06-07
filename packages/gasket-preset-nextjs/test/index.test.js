import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import preset from '../lib/index.js';
const {
  name,
  version,
  description,
  dependencies
} = require('../package.json');

describe('gasket-preset-nextjs', () => {

  it('is an object', () => {
    expect(typeof preset).toBe('object');
  });

  it('has expected properties', () => {
    expect(plugin).toHaveProperty('name', name);
    expect(plugin).toHaveProperty('version', version);
    expect(plugin).toHaveProperty('description', description);
  });

  it('has expected hooks', () => {
    const expected = [
      'presetPrompt',
      'presetConfig'
    ];
    expect(Object.keys(preset.hooks)).toEqual(expect.arrayContaining(expected));
  });

  it('has expected dependencies', () => {
    const expected = [
      '@gasket/plugin-cypress',
      '@gasket/plugin-express',
      '@gasket/plugin-https',
      '@gasket/plugin-jest',
      '@gasket/plugin-lint',
      '@gasket/plugin-mocha',
      '@gasket/plugin-nextjs',
      '@gasket/plugin-redux',
      '@gasket/plugin-typescript',
      '@gasket/plugin-webpack',
      '@gasket/plugin-winston',
      '@gasket/utils'
    ];
    expect(Object.keys(dependencies)).toEqual(expect.arrayContaining(expected));
  });
});
