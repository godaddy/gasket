import { describe, it, expect } from 'vitest';
import plugin from '../lib/index.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const fileName = fileURLToPath(import.meta.url);
const dirName = dirname(fileName);
const packageJson = JSON.parse(readFileSync(join(dirName, '../package.json'), 'utf8'));

describe('Plugin', function () {
  it('is an object', function () {
    expect(typeof plugin).toBe('object');
  });

  it('has expected name', function () {
    expect(plugin).toHaveProperty('name', packageJson.name);
  });

  it('has expected hooks', function () {
    const expected = [
      'express',
      'fastify'
    ];

    expect(plugin).toHaveProperty('hooks');

    const hooks = Object.keys(plugin.hooks);
    expect(hooks).toEqual(expected);
    expect(hooks).toHaveLength(expected.length);
  });
});
