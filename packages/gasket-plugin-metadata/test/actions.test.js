import { vi } from 'vitest';

const mockPlugin = {
  name: 'mock',
  hooks: {
    metadata: (gasket, metadata) => {
      return {
        ...metadata,
        modified: true,
        modules: [
          { name: 'fake-one', extra: true },
          { name: 'fake-two', extra: true }
        ]
      };
    }
  }
};

describe('actions', () => {
  let gasket,
    applyStub,
    handlerStub,
    metadata,
    actions;

  beforeEach(async function () {
    actions = (await import('../lib/actions.js')).default;
    applyStub = vi.fn();
    handlerStub = vi.fn();

    gasket = {
      config: {
        root: process.cwd()
      },
      execApply: async (event, fn) => {
        await applyStub(event);
        await fn({ name: 'mock' }, (meta) => {
          handlerStub(meta);
          return mockPlugin.hooks.metadata(gasket, meta);
        });
      }
    };

    const { getMetadata } = actions;
    metadata = await getMetadata(gasket);
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
    vi.spyOn(require, 'resolve').mockResolvedValueOnce();
    await actions.getMetadata(gasket);
    expect(applyStub).toHaveBeenCalled();
  });

  it('memoizes metadata & calls lifecycle once', async () => {
    vi.spyOn(require, 'resolve').mockResolvedValueOnce();
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
    expect(metadata).toHaveProperty('app');
  });

  it('adds presetInfo from loaded config', async () => {
    expect(metadata).toHaveProperty('presets');
  });

  it('adds pluginInfo from loaded config', async () => {
    expect(metadata).toHaveProperty('plugins');
  });

  it('ignores plugins and presets from app dependencies', async () => {
    const names = metadata.modules.map(m => m.name);
    expect(names).not.toContain('@gasket/plugin-mock');
    expect(names).not.toContain('@gasket/mock-preset');
  });

  it('executes the metadata lifecycle', async function () {
    expect(applyStub).toHaveBeenCalledTimes(1);
  });

  it('metadata hook is passed only metadata for hooking plugin', async function () {
    expect(handlerStub).toHaveBeenCalled();
    expect(handlerStub.mock.calls[0][0]).toHaveProperty('name', 'mock');
  });

  it('augments the metadata with data from the lifecycle hooks', async function () {
    expect(metadata.plugins[0].metadata).toHaveProperty('modified', true);
  });

  it('loads moduleInfo for modules declared in plugin metadata', async () => {
    const names = metadata.plugins[0].metadata.modules.map(m => m.name);
    expect(names).toContain('fake-one');
    expect(names).toContain('fake-two');
  });

  it('augments moduleInfo metadata for modules declared modules', async () => {
    const result = metadata.plugins[0].metadata.modules.find(mod => mod.name === 'fake-one');
    expect(result).toHaveProperty('extra', true);
  });
});
