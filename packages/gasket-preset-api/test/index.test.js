import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import preset from '../lib/index.js';

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
});
