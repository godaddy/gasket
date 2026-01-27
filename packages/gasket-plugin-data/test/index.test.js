import { describe, it, expect } from 'vitest';
import plugin from '../lib/index.js';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { name, version, description } = require('../package.json');

describe('Plugin', () => {
  it('should be an object', () => {
    expect(plugin).toBeInstanceOf(Object);
  });

  it('has expected properties', () => {
    expect(plugin).toHaveProperty('name', name);
    expect(plugin).toHaveProperty('version', version);
    expect(plugin).toHaveProperty('description', description);
    expect(plugin).toHaveProperty('actions');
    expect(plugin).toHaveProperty('hooks');
  });

  it('has expected hooks', () => {
    const expected = [
      'configure',
      'initReduxState',
      'metadata'
    ];

    expect(plugin).toHaveProperty('hooks');

    const hooks = Object.keys(plugin.hooks);
    expect(hooks).toEqual(expected);
    expect(hooks).toHaveLength(expected.length);
  });
});
