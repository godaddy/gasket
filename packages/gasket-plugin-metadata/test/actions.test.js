import { vi, describe, beforeEach, afterEach, it, expect } from 'vitest';

vi.mock('../lib/utils.js', { spy: true });

const mockPlugin = {
  name: '@gasket/mock',
  hooks: {
    metadata: (gasket, metadata) => {
      return {
        ...metadata,
        modified: true,
        modules: [
          { name: 'fake-one' },
          { name: 'fake-two' }
        ]
      };
    }
  }
};

describe('actions', () => {
  let gasket,
    applyStub,
    handlerStub,
    tryRequire,
    actions;

  beforeEach(async function () {
    actions = (await import('../lib/actions.js')).default;
    applyStub = vi.fn();
    handlerStub = vi.fn();
    tryRequire = (await import('../lib/utils.js')).tryRequire;

    gasket = {
      config: {
        root: process.cwd()
      },
      logger: {
        error: vi.fn()
      },
      execApply: async (event, fn) => {
        await applyStub(event);
        await fn({ name: mockPlugin.name }, (meta) => {
          handlerStub(meta);
          return mockPlugin.hooks.metadata(gasket, meta);
        });
      }
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('returns an actions object', () => {
    expect(typeof actions).toBe('object');
  });

  it('has a getMetadata function', () => {
    expect(typeof actions.getMetadata).toBe('function');
  });

  it('calls execApply metadata lifecycle', async () => {
    await actions.getMetadata(gasket);
    expect(applyStub).toHaveBeenCalled();
  });

  it('memoizes metadata & calls lifecycle once', async () => {
    await actions.getMetadata(gasket);
    await actions.getMetadata(gasket);
    expect(applyStub).toHaveBeenCalledTimes(1);
  });

  it('returns metadata object', async () => {
    const result = await actions.getMetadata(gasket);
    expect(result).toHaveProperty('app');
    expect(result).toHaveProperty('plugins');
    expect(result).toHaveProperty('modules');
    expect(result).toHaveProperty('presets');
  });

  it('adds moduleInfo for app', async () => {
    const result = await actions.getMetadata(gasket);
    expect(result).toHaveProperty('app');
  });

  it('adds presetInfo from loaded config', async () => {
    const result = await actions.getMetadata(gasket);
    expect(result).toHaveProperty('presets');
  });

  it('adds pluginInfo from loaded config', async () => {
    const result = await actions.getMetadata(gasket);
    expect(result).toHaveProperty('plugins');
  });

  it('ignores plugins and presets from app dependencies', async () => {
    const result = await actions.getMetadata(gasket);
    const names = result.modules.map(m => m.name);
    expect(names).not.toContain('@gasket/plugin-mock');
    expect(names).not.toContain('@gasket/mock-preset');
  });

  it('executes the metadata lifecycle', async function () {
    await actions.getMetadata(gasket);
    expect(applyStub).toHaveBeenCalledTimes(1);
  });

  it('metadata hook is passed only metadata for hooking plugin', async function () {
    await actions.getMetadata(gasket);
    expect(handlerStub).toHaveBeenCalled();
    expect(handlerStub.mock.calls[0][0]).toHaveProperty('name', '@gasket/mock');
  });

  it('augments the metadata with data from the lifecycle hooks', async function () {
    const result = await actions.getMetadata(gasket);
    expect(result.plugins[0].metadata).toHaveProperty('modified', true);
  });

  it('loads moduleInfo for modules declared in plugin metadata', async () => {
    const result = await actions.getMetadata(gasket);
    expect(result.modules).toEqual(result.plugins[0].metadata.modules);

    const names = result.modules.map(m => m.name);
    expect(names).toContain('fake-one');
    expect(names).toContain('fake-two');
  });

  it('augments moduleInfo metadata for modules declared modules', async () => {
    tryRequire.mockImplementation((pkgName) => {
      if (pkgName === 'fake-one/package.json') {
        return {
          name: 'fake-one',
          gasket: {
            metadata: {
              lifecycle: [{ name: 'init' }]
            }
          }
        };
      }
    });

    const result = await actions.getMetadata(gasket);

    expect(result).toHaveProperty('modules');
    expect(result.modules).toHaveLength(2);
    expect(tryRequire).toHaveBeenCalledTimes(2);

    expect(result.modules[0]).toHaveProperty('metadata');
    expect(result.modules[0].metadata).toHaveProperty('lifecycle');
    expect(result.modules[0].metadata.lifecycle).toEqual([{ name: 'init' }]);
  });

  it('skips moduleInfo if tryRequire returns undefined', async () => {
    tryRequire.mockReturnValueOnce(void 0);
    const result = await actions.getMetadata(gasket);
    expect(result.modules[0]).not.toHaveProperty('metadata.lifecycle');
  });

  it('handles errors resolving plugin path gracefully', async () => {
    gasket.execApply = async (event, fn) => {
      await applyStub(event);
      await fn({ name: '@gasket/plugin-bad' }, () => ({})); // valid plugin format triggers resolution
    };

    await actions.getMetadata(gasket);
    expect(gasket.logger.error).toHaveBeenCalledWith(expect.stringContaining('Error resolving plugin'));
  });

  it('returns same metadata object when memoized', async () => {
    const result1 = await actions.getMetadata(gasket);
    const result2 = await actions.getMetadata(gasket);
    expect(result1).toBe(result2);
  });

  it('handles missing package.json gracefully', async () => {
    gasket.config.root = 'non-existent';
    tryRequire.mockReturnValueOnce(void 0);
    const result = await actions.getMetadata(gasket);
    expect(result).toHaveProperty('app');
  });

  it('still returns metadata when module lacks gasket metadata', async () => {
    tryRequire.mockImplementation(pkg => {
      if (pkg === 'fake-one/package.json') {
        return { name: 'fake-one' }; // no gasket.metadata
      }
    });
    const result = await actions.getMetadata(gasket);
    expect(result.modules[0]).toHaveProperty('metadata');
    expect(result.modules[0].metadata).not.toHaveProperty('lifecycle');
  });
});
