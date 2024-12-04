import plugin from '../lib/index.js';
import create from '../lib/create.js';
import ready from '../lib/ready.js';
import commands from '../lib/commands.js';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { name, version, description } = require('../package.json');

describe('@gasket/plugin-command', () => {
  it('should export an object', () => {
    expect(plugin).toEqual(expect.any(Object));
  });

  it('should have properties', () => {
    expect(plugin).toHaveProperty('name', name);
    expect(plugin).toHaveProperty('version', version);
    expect(plugin).toHaveProperty('description', description);
    expect(plugin).toHaveProperty('hooks');
  });

  it('should have a create hook', () => {
    expect(plugin.hooks.create).toBe(create);
    expect(plugin.hooks.create).toEqual(expect.any(Function));
  });

  it('should have a ready hook', () => {
    expect(plugin.hooks.ready).toBe(ready);
    expect(plugin.hooks.ready).toEqual(expect.any(Function));
  });

  it('should have a commands hook', () => {
    expect(plugin.hooks.commands).toBe(commands);
    expect(plugin.hooks.commands).toEqual(expect.any(Function));
  });

  it('should include a metadata hook', () => {
    expect(plugin.hooks.metadata).toEqual(expect.any(Function));
  });

  it('should return metadata from the metadata hook', () => {
    const gasket = {}; // Mock Gasket instance
    const meta = { existing: 'value' };

    const result = plugin.hooks.metadata(gasket, meta);

    expect(result).toEqual(
      expect.objectContaining({
        existing: 'value',
        actions: expect.arrayContaining([
          { name: 'build', description: 'Gasket build command' }
        ]),
        lifecycles: expect.arrayContaining([
          {
            name: 'commands',
            method: 'exec',
            description: 'Add custom commands to the CLI',
            link: 'README.md#commands',
            parent: 'ready'
          }
        ])
      })
    );
  });

  it('should have expected hooks', () => {
    const expectedHooks = ['create', 'ready', 'commands', 'metadata'];
    expect(Object.keys(plugin.hooks)).toEqual(
      expect.arrayContaining(expectedHooks)
    );
  });
});
