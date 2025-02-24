import preset from '../lib/index.js';
import pkg from '../package.json' with { type: 'json' };
const {
  name,
  version,
  description,
  dependencies
} = pkg;

describe('gasket-preset-api', () => {

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
      'presetConfig',
      'create'
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
      '@gasket/plugin-typescript',
      '@gasket/plugin-swagger',
      '@gasket/plugin-winston'
    ];
    expect(Object.keys(dependencies)).toEqual(expect.arrayContaining(expected));
  });
});
