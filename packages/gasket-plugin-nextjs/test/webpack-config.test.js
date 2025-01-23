const { webpackConfig, validateNoGasketCore, externalizeGasketCore } = require('../lib/webpack-config.js');
const webpack = require('webpack');

jest.mock('../lib/utils/try-resolve.js');
const tryResolve = require('../lib/utils/try-resolve.js');

const mockFilename = '/path/to/app/gasket.js';

describe('webpackConfigHook', () => {
  let mockGasket, mockWebpackConfig, mockContext;

  beforeEach(() => {
    tryResolve.mockImplementation((moduleName) => moduleName);

    mockGasket = {
      config: {
        root: '/path/to/app'
      },
      logger: {
        warn: jest.fn()
      }
    };
    mockWebpackConfig = {
      name: '',
      externals: [],
      plugins: []
    };
    mockContext = {
      webpack
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('throws if externals is not an array', () => {
    mockWebpackConfig.externals = 'externals';

    expect(() => webpackConfig(mockGasket, mockWebpackConfig, mockContext))
      .toThrow('Expected webpackConfig.externals to be an array');
  });

  it('adds empty alias for try-resolve to avoid bundling', () => {
    tryResolve.mockReturnValue(mockFilename);
    const target = require.resolve('../lib/utils/try-resolve.js');
    const result = webpackConfig(mockGasket, mockWebpackConfig, mockContext);
    expect(result.resolve.alias).toEqual(expect.objectContaining({ [target]: false }));
  });

  it('adds empty alias for gasket.js file in client', () => {
    tryResolve.mockReturnValue(mockFilename);
    const result = webpackConfig(mockGasket, mockWebpackConfig, mockContext);
    expect(result.resolve.alias).toEqual(expect.objectContaining({ [mockFilename]: false }));
  });

  it('adds empty alias for expected default filenames', () => {
    const mjsFilename = '/path/to/app/gasket.mjs';
    tryResolve.mockReturnValue(mjsFilename);
    const result = webpackConfig(mockGasket, mockWebpackConfig, mockContext);
    expect(result.resolve.alias).toEqual(expect.objectContaining({ [mjsFilename]: false }));
  });

  it('adds empty alias for gasket.ts file in client', () => {
    const tsFilename = '/path/to/app/gasket.ts';
    tryResolve.mockReturnValue(tsFilename);
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

describe('externalizeGasketCore', () => {
  let mockCtx, mockCallback;

  beforeEach(() => {
    mockCtx = {
      request: '',
      dependencyType: ''
    };
    mockCallback = jest.fn();
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
    mockCtx = {
      request: ''
    };
    mockCallback = jest.fn();
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
