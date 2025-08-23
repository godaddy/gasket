vi.mock('../lib/utils/try-resolve.js', () => vi.fn());

const webpack = require('webpack');

const tryResolveModulePath = require.resolve('../lib/utils/try-resolve.js');
let tryResolve;
let webpackConfig;
let validateNoGasketCore;
let externalizeGasketCore;

const mockFilename = '/path/to/app/gasket.js';

describe('webpackConfigHook', () => {
  let mockGasket, mockWebpackConfig, mockContext;

  beforeEach(() => {
    // Stub try-resolve with a vi.fn and ensure webpack-config picks it up
    require.cache[tryResolveModulePath] = {
      id: tryResolveModulePath,
      filename: tryResolveModulePath,
      loaded: true,
      exports: vi.fn(() => null)
    };
    // Re-require webpack-config after stubbing
    delete require.cache[require.resolve('../lib/webpack-config.js')];
    ({ webpackConfig, validateNoGasketCore, externalizeGasketCore } = require('../lib/webpack-config.js'));
    tryResolve = require(tryResolveModulePath);

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

  it('adds empty alias for try-resolve to avoid bundling', () => {
    const target = require.resolve('../lib/utils/try-resolve.js');
    const result = webpackConfig(mockGasket, mockWebpackConfig, mockContext);
    expect(result.resolve.alias).toEqual(expect.objectContaining({ [target]: false }));
  });

  it('adds empty alias for gasket.js file in client', () => {
    tryResolve.mockImplementation((moduleName) => moduleName.includes('gasket.js') ? mockFilename : null);
    const result = webpackConfig(mockGasket, mockWebpackConfig, mockContext);
    expect(result.resolve.alias).toEqual(expect.objectContaining({ [mockFilename]: false }));
  });

  it('adds empty alias for expected default filenames', () => {
    const mjsFilename = '/path/to/app/gasket.mjs';
    tryResolve.mockImplementation((moduleName) => moduleName.includes('gasket.mjs') ? mjsFilename : null);
    const result = webpackConfig(mockGasket, mockWebpackConfig, mockContext);
    expect(result.resolve.alias).toEqual(expect.objectContaining({ [mjsFilename]: false }));
  });

  it('adds empty alias for gasket.ts file in client', () => {
    const tsFilename = '/path/to/app/gasket.ts';
    tryResolve.mockImplementation((moduleName) => moduleName.includes('gasket.ts') ? tsFilename : null);
    const result = webpackConfig(mockGasket, mockWebpackConfig, mockContext);
    expect(result.resolve.alias).toEqual(expect.objectContaining({ [tsFilename]: false }));
  });

  it('adds validateNoGasketCore to externals for client', () => {
    const result = webpackConfig(mockGasket, mockWebpackConfig, mockContext);
    expect(result.externals[0]).toBe(validateNoGasketCore);
  });

  it('adds GASKET_ENV env plugin', () => {
    mockContext.isServer = true;
    mockGasket.config.env = 'fake-env';

    const result = webpackConfig(mockGasket, mockWebpackConfig, mockContext);
    const plugin = result.plugins[0];
    expect(plugin).toBeInstanceOf(webpack.EnvironmentPlugin);
    expect(plugin).toEqual(expect.objectContaining({
      defaultValues: { GASKET_ENV: 'fake-env' }
    }));
  });
});

const mockCtxTemplate = () => ({ request: '', dependencyType: '' });

describe('externalizeGasketCore', () => {
  let mockCtx, mockCallback;

  beforeEach(() => {
    mockCtx = mockCtxTemplate();
    mockCallback = vi.fn();
  });

  it('returns module type for esm dependency when request matches gasket core', () => {
    mockCtx.request = '@gasket/core';
    mockCtx.dependencyType = 'esm';
    externalizeGasketCore(mockCtx, mockCallback);
    expect(mockCallback).toHaveBeenCalledWith(null, 'module @gasket/core');
  });

  it('returns commonjs type for non-esm dependency when request matches gasket core', () => {
    mockCtx.request = '@gasket/core';
    mockCtx.dependencyType = 'commonjs';
    externalizeGasketCore(mockCtx, mockCallback);
    expect(mockCallback).toHaveBeenCalledWith(null, 'commonjs @gasket/core');
  });

  it('returns undefined when request does not match gasket core', () => {
    mockCtx.request = 'other-package';
    externalizeGasketCore(mockCtx, mockCallback);
    expect(mockCallback).toHaveBeenCalledWith();
  });

  it('avoids closely name packages', () => {
    mockCtx.request = '@gasket/core-utils';
    mockCtx.dependencyType = 'esm';
    externalizeGasketCore(mockCtx, mockCallback);
    expect(mockCallback).toHaveBeenCalledWith();
    expect(mockCallback).not.toHaveBeenCalledWith(null, 'module @gasket/core-utils');
  });
});

describe('validateNoGasketCore', () => {
  let mockCtx, mockCallback;

  beforeEach(() => {
    mockCtx = { request: '' };
    mockCallback = vi.fn();
  });

  it('throws error when request matches gasket core', () => {
    mockCtx.request = '@gasket/core';
    validateNoGasketCore(mockCtx, mockCallback);
    expect(mockCallback).toHaveBeenCalledWith(new Error('@gasket/core should not be used in browser code.'));
  });

  it('does not throw error when request does not match gasket core', () => {
    mockCtx.request = 'other-package';
    validateNoGasketCore(mockCtx, mockCallback);
    expect(mockCallback).toHaveBeenCalledWith();
  });
});
