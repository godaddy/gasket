const { webpackConfig, validateNoGasketCore, externalizeGasketCore } = require('../lib/webpack-config.js');

describe('webpackConfigHook', () => {
  let mockGasket, mockWebpackConfig;

  beforeEach(() => {
    mockGasket = {};
    mockWebpackConfig = {
      name: '',
      externals: []
    };
  });

  it('adds validateNoGasketCore to externals for client', () => {
    mockWebpackConfig.name = 'client';
    const result = webpackConfig(mockGasket, mockWebpackConfig);
    expect(result.externals[0]).toBe(validateNoGasketCore);
  });

  it('adds externalizeGasketCore to externals for server', () => {
    mockWebpackConfig.name = 'server';
    const result = webpackConfig(mockGasket, mockWebpackConfig);
    expect(result.externals[0]).toBe(externalizeGasketCore);
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
