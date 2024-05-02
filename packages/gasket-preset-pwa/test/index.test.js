import { jest } from '@jest/globals';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import preset from '../lib/index.js';

describe('gasket-preset-pwa', () => {

  it('is an object', () => {
    expect(typeof preset).toBe('object');
  });

  it('has the expected name', () => {
    expect(preset).toHaveProperty('name', require('../package').name);
  });

  it('has expected hooks', () => {
    const expected = [
      'create'
    ];
    expect(Object.keys(preset.hooks)).toEqual(expect.arrayContaining(expected));
  });

  it('has expected create hook', () => {
    expect(preset.hooks.create).toBeInstanceOf(Function);
  });

  it('adds dependencies to package.json', async () => {
    const pkg = { add: jest.fn() };
    await preset.hooks.create({}, { pkg });
    expect(pkg.add).toHaveBeenCalledWith('dependencies', expect.any(Object));
  });
});
