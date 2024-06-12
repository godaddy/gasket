const plugin = require('../');
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
    metadata;

  beforeEach(async function () {
    applyStub = jest.fn();
    handlerStub = jest.fn();

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

    const { getMetadata } = plugin.hooks.actions(gasket);
    metadata = await getMetadata();
  });

  it('returns an actions object', () => {
    const actions = plugin.hooks.actions(gasket);
    expect(typeof actions).toBe('object');
  });

  it('has a getMetadata function', () => {
    const actions = plugin.hooks.actions(gasket);
    expect(typeof actions.getMetadata).toBe('function');
  });

  it('calls execApply metadata lifecycle', async () => {
    jest.spyOn(require, 'resolve').mockResolvedValueOnce();
    await plugin.hooks.actions(gasket).getMetadata();
    expect(applyStub).toHaveBeenCalled();
  });

  it('returns metadata object', async () => {
    const result = await plugin.hooks.actions(gasket).getMetadata();
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

  // it('adds moduleInfo from app dependencies', async () => {
  //   expect(metadata.modules.length).toBeGreaterThan(0);
  //   const names = metadata.modules.map(m => m.name);
  //   expect(names).toContain('fake-two');
  //   expect(names).toContain('fake-one');
  // });

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
    expect(metadata.plugins[0]).toHaveProperty('modified', true);
  });

  it('loads moduleInfo for modules declared in plugin metadata', async () => {
    const names = metadata.plugins[0].modules.map(m => m.name);
    expect(names).toContain('fake-one');
    expect(names).toContain('fake-two');
  });

  it('augments moduleInfo metadata for modules declared modules', async () => {
    const result = metadata.plugins[0].modules.find(mod => mod.name === 'fake-one');
    expect(result).toHaveProperty('extra', true);
  });

  // it('flattens moduleInfo from plugins', async () => {
  //   const names = metadata.modules.map(m => m.name);
  //   expect(names).toContain('fake-one');
  //   expect(names).toContain('fake-two');
  // });

  // it('flatting does not duplicate moduleInfo', async () => {
  //   const names = metadata.modules.map(m => m.name);
  //   expect(names.filter(n => n === 'fake-one')).toHaveLength(1);
  // });

  // it('flatting augments moduleInfo with extras from plugins', async () => {
  //   const result = metadata.modules.find(mod => mod.name === 'fake-one');
  //   expect(result).toHaveProperty('extra', true);
  // });
});
