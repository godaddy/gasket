import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const webpack = require('webpack');
const mockTryResolve = vi.fn(() => null);

vi.mock('../lib/utils/try-resolve.js', () => ({
  default: mockTryResolve
}));

let webpackConfig;

const mockFilename = '/path/to/app/gasket.js';

describe('webpackConfigHook', () => {
  let mockGasket, mockWebpackConfig, mockContext;

  beforeEach(async () => {
    mockTryResolve.mockClear();
    mockTryResolve.mockReturnValue(null);

    // Re-import webpack-config after clearing mocks
    vi.resetModules();
    const module = await import('../lib/webpack-config.js');
    ({ webpackConfig } = module);

    mockGasket = {
      config: {
        root: '/path/to/app'
      },
      logger: {
        warn: vi.fn()
      }
    };
    mockWebpackConfig = {
      name: '',
      externals: [],
      plugins: []
    };
    mockContext = {
      webpack,
      isServer: false
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('throws if externals is not an array', () => {
    mockWebpackConfig.externals = 'externals';

    expect(() => webpackConfig(mockGasket, mockWebpackConfig, mockContext))
      .toThrow('Expected webpackConfig.externals to be an array');
  });

  it('adds empty alias for try-resolve to avoid bundling', async () => {
    const target = new URL('../lib/utils/try-resolve.js', import.meta.url).pathname;
    const result = webpackConfig(mockGasket, mockWebpackConfig, mockContext);
    expect(result.resolve.alias).toHaveProperty(target);
  });

  it('adds empty alias for gasket.js file in client', () => {
    mockTryResolve.mockImplementation((moduleName) => moduleName.includes('gasket.js') ? mockFilename : null);
    const result = webpackConfig(mockGasket, mockWebpackConfig, mockContext);
    expect(result.resolve.alias).toEqual(expect.objectContaining({ [mockFilename]: false }));
  });

  it('adds empty alias for expected default filenames', () => {
    const mjsFilename = '/path/to/app/gasket.mjs';
    mockTryResolve.mockImplementation((moduleName) => moduleName.includes('gasket.mjs') ? mjsFilename : null);
    const result = webpackConfig(mockGasket, mockWebpackConfig, mockContext);
    expect(result.resolve.alias).toEqual(expect.objectContaining({ [mjsFilename]: false }));
  });

  it('adds empty alias for gasket.ts file in client', () => {
    const tsFilename = '/path/to/app/gasket.ts';
    mockTryResolve.mockImplementation((moduleName) => moduleName.includes('gasket.ts') ? tsFilename : null);
    const result = webpackConfig(mockGasket, mockWebpackConfig, mockContext);
    expect(result.resolve.alias).toEqual(expect.objectContaining({ [tsFilename]: false }));
  });

  it('adds GASKET_ENV env plugin', () => {
    mockContext.isServer = true;
    mockGasket.config.env = 'fake-env';

    const result = webpackConfig(mockGasket, mockWebpackConfig, mockContext);
    const plugin = result.plugins.find((p) => p instanceof webpack.EnvironmentPlugin);
    expect(plugin).toEqual(expect.objectContaining({
      defaultValues: { GASKET_ENV: 'fake-env' }
    }));
  });

  it('seeds plugins when absent from the webpack config', () => {
    delete mockWebpackConfig.plugins;

    const result = webpackConfig(mockGasket, mockWebpackConfig, mockContext);
    expect(result.plugins.some((p) => p instanceof webpack.EnvironmentPlugin)).toBe(true);
  });

  // validateNoGasketCore is internal; it is wired in as the first client external.
  describe('client @gasket/core externals guard', () => {
    let guard, mockCallback;

    beforeEach(() => {
      const result = webpackConfig(mockGasket, mockWebpackConfig, mockContext);
      guard = result.externals[0];
      mockCallback = vi.fn();
    });

    it('is added as the first client external', () => {
      expect(typeof guard).toBe('function');
    });

    it('errors when a request resolves to @gasket/core', () => {
      guard({ request: '@gasket/core' }, mockCallback);
      expect(mockCallback).toHaveBeenCalledWith(new Error('@gasket/core should not be used in browser code.'));
    });

    it('passes through unrelated requests', () => {
      guard({ request: 'other-package' }, mockCallback);
      expect(mockCallback).toHaveBeenCalledWith();
    });

    it('does not match closely-named packages', () => {
      guard({ request: '@gasket/core-utils' }, mockCallback);
      expect(mockCallback).toHaveBeenCalledWith();
    });
  });

  // replaceGasketFiles is internal; it appends a NormalModuleReplacementPlugin.
  describe('gasket-file replacement plugin', () => {
    const filePattern = /(create|webpack-config)\.m?c?js$/;
    const isGasketPluginPath = /(@gasket\/plugin-|@[\w-]+\/gasket-plugin-)/;
    let replacement;

    beforeEach(() => {
      const result = webpackConfig(mockGasket, mockWebpackConfig, mockContext);
      replacement = result.plugins.find((p) => p instanceof webpack.NormalModuleReplacementPlugin);
    });

    it('appends a NormalModuleReplacementPlugin', () => {
      expect(replacement).toBeInstanceOf(webpack.NormalModuleReplacementPlugin);
    });

    it('rewrites create/webpack-config requests from a Gasket plugin path to the empty module', () => {
      const resource = {
        context: '/node_modules/@gasket/plugin-nextjs/lib',
        request: 'create.js'
      };
      replacement.resourceRegExp.lastIndex = 0;
      expect(filePattern.test(resource.request)).toBe(true);
      replacement.newResource(resource);
      expect(resource.request).toMatch(/noop-replacement\.mjs$/);
    });

    it('rewrites requests matched on the request path itself', () => {
      const resource = {
        context: '/some/path',
        request: '@gasket/plugin-nextjs/lib/create.js'
      };
      expect(isGasketPluginPath.test(resource.request)).toBe(true);
      replacement.newResource(resource);
      expect(resource.request).toMatch(/noop-replacement\.mjs$/);
    });

    it('leaves files from non-Gasket plugin paths untouched', () => {
      const resource = {
        context: '/node_modules/some-other-package/lib',
        request: 'create.js'
      };
      replacement.newResource(resource);
      expect(resource.request).toBe('create.js');
    });

    it('only targets create/webpack-config filenames', () => {
      expect(filePattern.test('create.mjs')).toBe(true);
      expect(filePattern.test('webpack-config.cjs')).toBe(true);
      expect(filePattern.test('other.js')).toBe(false);
      expect(filePattern.test('create.ts')).toBe(false);
    });
  });
});
