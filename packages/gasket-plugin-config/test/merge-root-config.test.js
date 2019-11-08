const path = require('path');
const mergeRootConfig = require('../lib/merge-root-config');

describe('mergeRootConfig', () => {
  let result, mockGasket, mockConfig;

  beforeEach(() => {
    mockGasket = {
      config: {
        root: path.join(__dirname, 'fixtures', 'root-config'),
        env: 'dev'
      }
    };
    mockConfig = { some: 'value' };
  });

  it('returns empty object if no config file or ./config', () => {
    mockGasket.config.root = 'bogus';
    result = mergeRootConfig(mockGasket);
    expect(result).toEqual({});
  });

  it('returns initial config if no config file', () => {
    mockGasket.config.root = 'bogus';
    result = mergeRootConfig(mockGasket, mockConfig);
    expect(result).toBe(mockConfig);
  });

  it('merges config from root file', () => {
    result = mergeRootConfig(mockGasket, mockConfig);
    expect(result).toEqual({
      someService: {
        url: 'https://some-test.url/',
        requestRate: 9000
      },
      some: 'value'
    });
  });

  it('prefers config from ./config files', () => {
    mockConfig = {
      someService: {
        url: 'https://some-custom.url/'
      }
    };
    result = mergeRootConfig(mockGasket, mockConfig);
    expect(result).toEqual({
      someService: {
        url: 'https://some-custom.url/',
        requestRate: 9000
      }
    });
  });
});
