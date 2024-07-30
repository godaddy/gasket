const applyConfigOverrides = require('../lib/apply-config-overrides');

describe('applyConfigOverrides', () => {
  let results, mockContext, mockConfig;

  beforeEach(() => {
    mockContext = {
      env: 'dev',
      commandId: 'start'
    };
    mockConfig = {
      someService: {
        url: 'https://some-test.url/'
      }
    };
  });

  it('returns unmodified config if no "environments"', () => {
    results = applyConfigOverrides(mockConfig, mockContext);
    expect(results).toEqual(mockConfig);
  });

  it('removes "environments" from config result', () => {
    mockConfig.environments = {
      bogus: {}
    };

    results = applyConfigOverrides(mockConfig, mockContext);
    expect(results).not.toHaveProperty('environments');
  });

  it('returns unmodified config if no matching env', () => {
    mockConfig.environments = {
      bogus: {}
    };

    results = applyConfigOverrides(mockConfig, mockContext);
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

    results = applyConfigOverrides(mockConfig, mockContext);
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

    results = applyConfigOverrides(mockConfig, mockContext);
    expect(results).toEqual({
      someService: {
        url: 'https://some-dev-test.url/'
      }
    });
  });

  it('deep merges sub-env', () => {
    mockContext.env = 'dev.sub';
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

    results = applyConfigOverrides(mockConfig, mockContext);
    expect(results).toEqual({
      someService: {
        url: 'https://some-sub-dev-test.url/',
        requestRate: 9000
      },
      other: 'setting'
    });
  });

  it('ignores non-matching sub-env', () => {
    mockContext.env = 'dev.sub2';
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

    results = applyConfigOverrides(mockConfig, mockContext);
    expect(results).toEqual({
      someService: {
        url: 'https://some-dev-test.url/',
        requestRate: 9000
      }
    });
  });

  it('local inherits from development env', () => {
    mockContext.env = 'local';

    mockConfig.someService.requestRate = 5000;
    mockConfig.environments = {
      dev: {
        someService: {
          url: 'https://some-dev-test.url/',
          requestRate: 9000
        }
      }
    };

    results = applyConfigOverrides(mockConfig, mockContext);
    expect(results).toEqual({
      someService: {
        url: 'https://some-dev-test.url/',
        requestRate: 9000
      }
    });
  });

  it('local inherits from development env, supporting local specific settings', () => {
    mockContext.env = 'local';

    mockConfig.someService.requestRate = 5000;
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

    results = applyConfigOverrides(mockConfig, mockContext);
    expect(results).toEqual({
      someService: {
        url: 'https://some-local-test.url/',
        requestRate: 9000
      }
    });
  });

  it('ignores missing local override file', () => {
    mockContext.env = 'local';
    mockContext.localFile = './fixtures/missing';

    results = applyConfigOverrides(mockConfig, mockContext);
    expect(results).toEqual({
      someService: {
        url: 'https://some-test.url/'
      }
    });
  });

  describe('commands', function () {

    it('deep merges properties from matching command id', () => {
      mockConfig.commands = {
        start: {
          someService: {
            requestRate: 9000
          }
        }
      };

      results = applyConfigOverrides(mockConfig, mockContext);
      expect(results).toEqual({
        someService: {
          url: 'https://some-test.url/',
          requestRate: 9000
        }
      });
    });

    it('overrides properties from matching command id', () => {
      mockConfig.commands = {
        start: {
          someService: {
            url: 'https://some-dev-test.url/'
          }
        }
      };

      results = applyConfigOverrides(mockConfig, mockContext);
      expect(results).toEqual({
        someService: {
          url: 'https://some-dev-test.url/'
        }
      });
    });
  });
});
