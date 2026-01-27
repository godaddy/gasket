import { describe, it, expect } from 'vitest';
import { createRequire } from 'node:module';
import plugin from '../lib/index.js';

const require = createRequire(import.meta.url);
const { name, version, description } = require('../package.json');

describe('Plugin', function () {

  it('is an object', () => {
    expect(typeof plugin).toBe('object');
  });

  it('has expected properties', () => {
    expect(plugin).toHaveProperty('name', name);
    expect(plugin).toHaveProperty('version', version);
    expect(plugin).toHaveProperty('description', description);
  });

  it('has expected hooks', () => {
    const expected = [
      'createServers',
      'metadata'
    ];

    expect(plugin).toHaveProperty('hooks');

    const hooks = Object.keys(plugin.hooks);
    expect(hooks).toEqual(expected);
    expect(hooks).toHaveLength(expected.length);
  });
});

