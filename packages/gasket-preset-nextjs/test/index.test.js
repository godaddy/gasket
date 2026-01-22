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
    expect(preset).toHaveProperty('name', name);
    expect(preset).toHaveProperty('version', version);
    expect(preset).toHaveProperty('description', description);
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
      '@gasket/plugin-express',
      '@gasket/plugin-https',
      '@gasket/plugin-nextjs',
      '@gasket/plugin-typescript',
      '@gasket/plugin-webpack',
      '@gasket/plugin-winston',
      '@gasket/utils'
    ];
    expect(Object.keys(dependencies)).toEqual(expect.arrayContaining(expected));
  });
});
