import { vi } from 'vitest';
import plugin from '../lib/index.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const {
  name,
  version,
  description,
  devDependencies
} = require('../package.json');

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
      'metadata'
    ];

    expect(plugin).toHaveProperty('hooks');

    const hooks = Object.keys(plugin.hooks);
    expect(hooks).toEqual(expected);
    expect(hooks).toHaveLength(expected.length);
  });
});

describe('create hook', () => {
  let mockContext;
  beforeEach(() => {

    mockContext = {
      pkg: {
        add: vi.fn(),
        has: vi.fn()
      },
      gasketConfig: { addPlugin: vi.fn() }
    };
  });

  it('adds itself to the dependencies', async function () {
    await plugin.hooks.create({}, mockContext);

    expect(mockContext.pkg.add).toHaveBeenCalledWith('dependencies', {
      [name]: `^${version}`
    });
  });

  it('adds appropriate devDependencies', async function () {
    await plugin.hooks.create({}, mockContext);

    expect(mockContext.pkg.add).toHaveBeenCalledWith('devDependencies', {
      webpack: devDependencies.webpack
    });
  });

  it('adds plugin import to the gasket file', async function () {
    await plugin.hooks.create({}, mockContext);

    expect(mockContext.gasketConfig.addPlugin).toHaveBeenCalledWith('pluginWebpack', name);
  });
});
