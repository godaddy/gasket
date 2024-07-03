const { webpackConfig, validateNoGasketCore, externalizeGasketCore } = require('../lib/webpack-config.js');

const mockFilename = '/path/to/gasket.js';

describe('webpackConfigHook', () => {
  let mockGasket, mockWebpackConfig, mockContext;

  beforeEach(() => {
    mockGasket = {
      config: {
        filename: mockFilename
      },
      logger: {
        warn: jest.fn()
      }
    };
    mockWebpackConfig = {
      name: '',
      externals: []
    };
    mockContext = {};
  });

  it('throws if externals is not an array', () => {
    mockWebpackConfig.externals = 'externals';

    expect(() => webpackConfig(mockGasket, mockWebpackConfig, mockContext))
      .toThrow('Expected webpackConfig.externals to be an array');
  });

  it('adds empty alias for gasket file in client', () => {
    const result = webpackConfig(mockGasket, mockWebpackConfig, mockContext);
    expect(result.resolve.alias).toEqual(expect.objectContaining({ [mockFilename]: false }));
  });

  it('warns if filename not configured', () => {
    delete mockGasket.config.filename;
    webpackConfig(mockGasket, mockWebpackConfig, mockContext);
    expect(mockGasket.logger.warn).toHaveBeenCalledWith('Gasket `filename` was not configured in makeGasket');
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
