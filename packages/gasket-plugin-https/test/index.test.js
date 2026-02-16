import { describe, it, expect } from 'vitest';
import plugin from '../lib/index.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const fileName = fileURLToPath(import.meta.url);
const dirName = dirname(fileName);

const pkg = JSON.parse(readFileSync(join(dirName, '../package.json'), 'utf8'));
const { name, version, description } = pkg;

describe('Plugin', () => {
  it('is an object', () => {
    expect(typeof plugin).toBe('object');
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
      'create',
      'configure',
      'metadata'
    ];

    expect(plugin).toHaveProperty('hooks');

    const hooks = Object.keys(plugin.hooks);
    expect(hooks).toEqual(expected);
    expect(hooks).toHaveLength(expected.length);
  });
});
