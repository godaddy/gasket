import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import plugin from '../lib/index.js';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { name, version, description } = require('../package.json');

describe('@gasket/plugin-command', () => {
  it('should export an object', () => {
    assert.equal(typeof plugin, 'object');
  });

  it('should have properties', () => {
    assert.equal(plugin.name, name);
    assert.equal(plugin.version, version);
    assert.equal(plugin.description, description);
    assert.ok(plugin.hooks);
  });

  it('should have expected hooks', () => {
    const expectedHooks = [
      'create',
      'configure',
      'prepare',
      'commands',
      'ready',
      'metadata'
    ];
    const hookKeys = Object.keys(plugin.hooks);
    expectedHooks.forEach(hook => {
      assert.ok(hookKeys.includes(hook), `Missing hook: ${hook}`);
    });
  });

  it('should return metadata from the metadata hook', () => {
    const gasket = {}; // Mock Gasket instance
    const meta = { existing: 'value' };

    const result = plugin.hooks.metadata(gasket, meta);

    assert.equal(result.existing, 'value');
    assert.ok(Array.isArray(result.commands));
    assert.ok(result.commands.some(cmd =>
      cmd.name === 'build' &&
      cmd.description === 'Gasket build command' &&
      cmd.link === 'README.md#build'
    ));
    assert.ok(Array.isArray(result.lifecycles));
    assert.ok(result.lifecycles.some(lc =>
      lc.name === 'commands' &&
      lc.method === 'exec' &&
      lc.description === 'Add custom commands to the CLI' &&
      lc.link === 'README.md#commands' &&
      lc.parent === 'prepare'
    ));
    assert.ok(result.lifecycles.some(lc =>
      lc.name === 'build' &&
      lc.method === 'exec' &&
      lc.description === 'Gasket build lifecycle' &&
      lc.link === 'README.md#build' &&
      lc.parent === 'commands'
    ));
  });
});
