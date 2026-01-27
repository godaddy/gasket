import { describe, it, expect, beforeEach } from 'vitest';
import plugin from '../lib/index.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { name, version, description } = require('../package');

describe('Plugin', function () {
  let gasket;

  beforeEach(function () {
    gasket = {
      config: {
        root: process.cwd()
      }
    };
  });

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

  it('has expected actions', () => {
    const expected = [
      'startProxyServer'
    ];

    expect(plugin).toHaveProperty('actions');

    const actions = Object.keys(plugin.actions);
    expect(actions).toEqual(expected);
    expect(actions).toHaveLength(expected.length);
  });

  it('has expected hooks', () => {
    const expected = [
      'metadata'
    ];

    expect(plugin).toHaveProperty('hooks');

    const hooks = Object.keys(plugin.hooks);
    expect(hooks).toEqual(expected);
    expect(hooks).toHaveLength(expected.length);
  });

  it('outputs expected metadata', async function () {
    const meta = await plugin.hooks.metadata(gasket, {});
    const expected = [
      'actions',
      'lifecycles',
      'configurations'
    ];

    const keys = Object.keys(meta);
    expect(keys).toEqual(expected);
    expect(keys).toHaveLength(expected.length);
  });
});
