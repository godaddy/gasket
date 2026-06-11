import { describe, it, expect } from 'vitest';
import plugin from '../lib/index.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const pkg = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf8'));

describe('Plugin', () => {
  it('exports an object', () => {
    expect(plugin).toBeTypeOf('object');
  });

  it.each([
    ['name', pkg.name],
    ['version', pkg.version],
    ['description', pkg.description]
  ])('mirrors package %s', (prop, value) => {
    expect(plugin[prop]).toBe(value);
  });

  it.each(['actions', 'hooks'])('exposes %s', (prop) => {
    expect(plugin[prop]).toBeDefined();
  });

  it('hooks exactly configure and metadata', () => {
    expect(Object.keys(plugin.hooks)).toStrictEqual(['configure', 'metadata']);
  });
});
