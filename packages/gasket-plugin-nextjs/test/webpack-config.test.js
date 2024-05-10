const { webpackConfig, validateNoGasketCore, externalizeGasketCore } = require('../lib/webpack-config.js');

describe('webpackConfigHook', () => {
  let mockGasket, mockWebpackConfig, mockContext;

  beforeEach(() => {
    mockGasket = {};
    mockWebpackConfig = {
      name: '',
      externals: []
    };
    mockContext = {};
  });

  it('adds validateNoGasketCore to externals for client', () => {
    const result = webpackConfig(mockGasket, mockWebpackConfig, mockContext);
    expect(result.externals[0]).toBe(validateNoGasketCore);
  });

  it('adds externalizeGasketCore to externals for server', () => {
    mockContext.isServer = true;
    const result = webpackConfig(mockGasket, mockWebpackConfig, mockContext);
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
