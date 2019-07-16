const applyEnvironmentOverrides = require('../lib/apply-env-overrides');

describe('applyEnvironmentOverrides', () => {
  let results, mockGasketConfig, mockConfig;

  beforeEach(() => {
    jest.resetModules();
    mockGasketConfig = {
      env: 'dev',
      root: __dirname
    };
    mockConfig = {
      someService: {
        url: 'https://some-test.url/'
      }
    };
  });

  it('returns unmodified config if no "environments"', () => {
    results = applyEnvironmentOverrides(mockGasketConfig, mockConfig);
    expect(results).toEqual(mockConfig);
  });

  it('removes "environments" from config result', () => {
    mockConfig.environments = {
      bogus: {}
    };

    results = applyEnvironmentOverrides(mockGasketConfig, mockConfig);
    expect(results).not.toHaveProperty('environments');
  });

  it('returns unmodified config if no matching env', () => {
    mockConfig.environments = {
      bogus: {}
    };

    results = applyEnvironmentOverrides(mockGasketConfig, mockConfig);
    expect(results).toEqual({
      someService: {
        url: 'https://some-test.url/'
      }
    });
  });

  it('deep merges properties from matching env', () => {
    mockConfig.environments = {
      dev: {
        someService: {
          requestRate: 9000
        }
      }
    };

    results = applyEnvironmentOverrides(mockGasketConfig, mockConfig);
    expect(results).toEqual({
      someService: {
        url: 'https://some-test.url/',
        requestRate: 9000
      }
    });
  });

  it('overrides properties from matching env', () => {
    mockConfig.environments = {
      dev: {
        someService: {
          url: 'https://some-dev-test.url/'
        }
      }
    };

    results = applyEnvironmentOverrides(mockGasketConfig, mockConfig);
    expect(results).toEqual({
      someService: {
        url: 'https://some-dev-test.url/'
      }
    });
  });

  it('deep merges sub-env', () => {
    mockGasketConfig.env = 'dev.sub';
    mockConfig.environments = {
      'dev': {
        someService: {
          url: 'https://some-dev-test.url/',
          requestRate: 9000
        }
      },
      'dev.sub': {
        someService: {
          url: 'https://some-sub-dev-test.url/'
        },
        other: 'setting'
      }
    };

    results = applyEnvironmentOverrides(mockGasketConfig, mockConfig);
    expect(results).toEqual({
      someService: {
        url: 'https://some-sub-dev-test.url/',
        requestRate: 9000
      },
      other: 'setting'
    });
  });

  it('ignores non-matching sub-env', () => {
    mockGasketConfig.env = 'dev.sub2';
    mockConfig.environments = {
      'dev': {
        someService: {
          url: 'https://some-dev-test.url/',
          requestRate: 9000
        }
      },
      'dev.sub': {
        someService: {
          url: 'https://some-sub-dev-test.url/'
        },
        other: 'setting'
      }
    };

    results = applyEnvironmentOverrides(mockGasketConfig, mockConfig);
    expect(results).toEqual({
      someService: {
        url: 'https://some-dev-test.url/',
        requestRate: 9000
      }
    });
  });

  it('local inherits from development env', () => {
    mockGasketConfig.env = 'local';
    mockConfig.environments = {
      dev: {
        someService: {
          url: 'https://some-dev-test.url/',
          requestRate: 9000
        }
      },
      local: {
        someService: {
          url: 'https://some-local-test.url/'
        }
      }
    };

    results = applyEnvironmentOverrides(mockGasketConfig, mockConfig);
    expect(results).toEqual({
      someService: {
        url: 'https://some-local-test.url/',
        requestRate: 9000
      }
    });
  });

  it('load locale override file for local env when set', () => {
    mockGasketConfig.env = 'local';
    results = applyEnvironmentOverrides(
      mockGasketConfig,
      mockConfig,
      './fixtures/config.local');
    expect(results).toEqual({
      localsOnly: true,
      someService: {
        url: 'https://some-test.url/'
      }
    });
  });

  it('ingores missing local override file', () => {
    mockGasketConfig.env = 'local';
    results = applyEnvironmentOverrides(
      mockGasketConfig,
      mockConfig,
      './fixtures/missing');
    expect(results).toEqual({
      someService: {
        url: 'https://some-test.url/'
      }
    });
  });
});
