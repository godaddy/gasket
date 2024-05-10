import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import preset from '../lib/index.js';
const { dependencies } = require('../package.json');

describe('gasket-preset-api', () => {

  it('is an object', () => {
    expect(typeof preset).toBe('object');
  });

  it('has the expected name', () => {
    expect(preset).toHaveProperty('name', require('../package').name);
  });

  it('has expected hooks', () => {
    const expected = [
      'presetPrompt',
      'presetConfig',
      'create'
    ];
    expect(Object.keys(preset.hooks)).toEqual(expect.arrayContaining(expected));
  });

  it('has expected dependencies', () => {
    const expected = [
      '@gasket/plugin-cypress',
      '@gasket/plugin-docs',
      '@gasket/plugin-docusaurus',
      '@gasket/plugin-express',
      '@gasket/plugin-https',
      '@gasket/plugin-jest',
      '@gasket/plugin-lint',
      '@gasket/plugin-mocha',
      '@gasket/plugin-response-data',
      '@gasket/plugin-typescript',
      '@gasket/plugin-swagger',
      '@gasket/plugin-winston'
    ];
    expect(Object.keys(dependencies)).toEqual(expect.arrayContaining(expected));
  });
});
