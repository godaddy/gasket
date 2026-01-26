/* eslint-disable max-statements */
import { vi } from 'vitest';

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

const mockAppPkg = {
  name: 'gasket-app',
  version: '1.0.0'
};

describe('actions', () => {
  let gasket,
    applyStub,
    handlerStub,
    tryImport,
    actions;

  beforeEach(async function () {
    actions = (await import('../lib/actions.js')).default;
    applyStub = vi.fn();
    handlerStub = vi.fn();
    tryImport = (await import('../lib/utils.js')).tryImport;

    // Set up default mock for tryImport to return null for missing files
    tryImport.mockImplementation(async (pth) => {
      if (pth.endsWith('/test/app/package.json')) {
        return mockAppPkg;
      }
      Promise.resolve(null);
    });

    gasket = {
      config: {
        root: process.cwd(),
        appRoot: '/test/app'
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
  });

  it('adds moduleInfo for app', async () => {
    const result = await actions.getMetadata(gasket);

    expect(result).toHaveProperty('app', expect.objectContaining({
      ...mockAppPkg,
      metadata: expect.objectContaining({
        name: mockAppPkg.name
      })
    }));

    expect(gasket.logger.error).not.toHaveBeenCalled();
  });

  it('logs errors with fallback if cannot find app package', async () => {
    tryImport.mockResolvedValue(null);
    const result = await actions.getMetadata(gasket);

    expect(result).toHaveProperty('app', expect.objectContaining({
      name: 'unknown',
      metadata: expect.objectContaining({
        name: 'unknown'
      })
    }));

    expect(gasket.logger.error).toHaveBeenCalledWith(
      expect.stringContaining('Error loading app metadata')
    );
  });

  it('adds pluginInfo from loaded config', async () => {
    const result = await actions.getMetadata(gasket);
    expect(result).toHaveProperty('plugins');
  });

  it('ignores plugins from app dependencies', async () => {
    const result = await actions.getMetadata(gasket);
    const names = result.modules.map(m => m.name);
    expect(names).not.toContain('@gasket/plugin-mock');
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
    tryImport.mockImplementation((pkgName) => {
      return new Promise((resolve) => {
        if (pkgName.endsWith('fake-one/package.json')) {
          resolve({
            name: 'fake-one',
            gasket: {
              metadata: {
                lifecycle: [{
                  name: 'init'
                }]
              }
            }
          });
        } else {
          resolve(null);
        }
      });
    });

    const result = await actions.getMetadata(gasket);

    expect(result).toHaveProperty('modules');
    expect(result.modules).toHaveLength(2);
    expect(tryImport).toHaveBeenCalledTimes(3);

    expect(result.modules[0]).toHaveProperty('metadata');
    expect(result.modules[0].metadata).toHaveProperty('lifecycle');
    expect(result.modules[0].metadata.lifecycle).toEqual([{ name: 'init' }]);
  });
});
