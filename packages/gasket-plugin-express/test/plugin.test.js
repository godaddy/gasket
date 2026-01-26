import { describe, it, expect } from 'vitest';
import { createRequire } from 'module';
import plugin from '../lib/index.js';

const require = createRequire(import.meta.url);
const { name, version, description } = require('../package.json');

describe('Plugin', () => {
  it('is an object', () => {
    expect(plugin).toBeInstanceOf(Object);
  });

  it('has expected properties', () => {
    expect(plugin).toHaveProperty('name', name);
    expect(plugin).toHaveProperty('version', version);
    expect(plugin).toHaveProperty('description', description);
  });

  it('has expected hooks', () => {
    const expected = ['createServers', 'metadata'];
    expect(Object.keys(plugin.hooks)).toEqual(expected);
  });
});
