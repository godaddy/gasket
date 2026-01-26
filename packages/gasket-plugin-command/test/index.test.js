import plugin from '../lib/index.js';
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

  it('should have expected hooks', () => {
    const expectedHooks = [
      'configure',
      'prepare',
      'commands',
      'ready',
      'metadata'
    ];
    expect(Object.keys(plugin.hooks)).toEqual(
      expect.arrayContaining(expectedHooks)
    );
  });

  it('should return metadata from the metadata hook', () => {
    const gasket = {}; // Mock Gasket instance
    const meta = { existing: 'value' };

    const result = plugin.hooks.metadata(gasket, meta);

    expect(result).toEqual(
      expect.objectContaining({
        existing: 'value',
        commands: expect.arrayContaining([
          {
            name: 'build',
            description: 'Gasket build command',
            link: 'README.md#build'
          }
        ]),
        lifecycles: expect.arrayContaining([
          {
            name: 'commands',
            method: 'exec',
            description: 'Add custom commands to the CLI',
            link: 'README.md#commands',
            parent: 'prepare'
          },
          {
            name: 'build',
            method: 'exec',
            description: 'Gasket build lifecycle',
            link: 'README.md#build',
            parent: 'commands'
          }
        ])
      })
    );
  });
});
