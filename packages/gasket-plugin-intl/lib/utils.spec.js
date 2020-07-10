/* eslint-disable no-sync */
const fs = require('fs');
const utils = require('./utils');

jest.mock('fs');

const defaultConfig = require('./default-config');

const setupGasket = config => ({
  config: {
    root: '/some-root',
    ...config
  }
});

describe('getIntlConfig', () => {

  it('returns defaults', () => {
    const results = utils.getIntlConfig({});
    expect(results).toEqual(defaultConfig);
  });

  it('returns config from gasket.config.js', () => {
    const results = utils.getIntlConfig(setupGasket({
      intl: {
        assetPrefix: 'BOGUS'
      }
    }));
    expect(results).toEqual({
      ...defaultConfig,
      assetPrefix: 'BOGUS'
    });
  });
});

describe('getAssetPrefix', () => {

  it('returns the assetPrefix from intl config', () => {
    const results = utils.getAssetPrefix(setupGasket({
      intl: {
        assetPrefix: '//cdn-a'
      }
    }));
    expect(results).toEqual('//cdn-a');
  });

  it('returns the assetPrefix from zone config', () => {
    const results = utils.getAssetPrefix(setupGasket({
        zone: '//cdn-b'
    }));
    expect(results).toEqual('//cdn-b');
  });

  it('returns the assetPrefix from intl config over next', () => {
    const results = utils.getAssetPrefix(setupGasket({
      intl: {
        assetPrefix: '//cdn-a'
      },
      zone: '//cdn-b'
    }));
    expect(results).toEqual('//cdn-a');
  });

  it('returns empty string if not configured', () => {
    const results = utils.getAssetPrefix(setupGasket({}));
    expect(results).toEqual('');
  });
});

describe('getIntlLanguageMap', () => {

  it('returns object from config', () => {
    const results = utils.getIntlLanguageMap(setupGasket({
      intl: {
        languageMap: {
          A: 'B'
        }
      }
    }));
    expect(results).toEqual({ A: 'B' });
  });

  it('returns empty object if not configured', () => {
    const results = utils.getIntlLanguageMap(setupGasket({}));
    expect(results).toEqual({});
  });
});

describe('getDefaultLanguage', () => {

  it('returns object from config', () => {
    const results = utils.getDefaultLanguage(setupGasket({
      intl: {
        defaultLanguage: 'fr-FR'
      }
    }));
    expect(results).toEqual('fr-FR');
  });

  it('returns en-US if not configured', () => {
    const results = utils.getDefaultLanguage(setupGasket({}));
    expect(results).toEqual('en-US');
  });
});

describe('getOutputDir', () => {

  it('returns full outputDir from config', () => {
    const results = utils.getOutputDir(setupGasket({
      intl: {
        outputDir: './some/build/dir'
      }
    }));
    expect(results).toEqual('/some-root/some/build/dir');
  });

  it('returns default if not configured', () => {
    const results = utils.getOutputDir(setupGasket({}));
    expect(results).toEqual('/some-root/build/locales');
  });
});

describe('loadLocalesManifest', () => {
  const mockOutputDir = './some/build/dir';

  beforeEach(() => {
    utils.loadLocalesManifest.__manifest = null;
  });

  it('reads the locale file from the outputDir', () => {
    utils.loadLocalesManifest(mockOutputDir);
    expect(fs.readFileSync).toHaveBeenCalledWith(
      expect.stringContaining('locales-manifest.json'),
      'utf8'
    );
  });

  it('returns locale manifest as json', () => {
    const results = utils.loadLocalesManifest(mockOutputDir);
    expect(results).toEqual(expect.objectContaining({
      '__default__': 'test-app',
      'test-app': expect.objectContaining({
        'en-US': 'aaaaaaa'
      })
    }));
  });

  it('only reads the file once, returns stored version', () => {
    const resultsA = utils.loadLocalesManifest(mockOutputDir);
    const resultsB = utils.loadLocalesManifest(mockOutputDir);
    expect(resultsA).toBe(resultsB);
    expect(fs.readFileSync).toHaveBeenCalledTimes(1);
  });
});

describe('getMappedLanguage', function () {
  let mockGasket;

  beforeEach(() => {
    const languageMap = { 'a1-A1': 'a2-A2', 'b1-B1': 'b2-B2' };
    mockGasket = setupGasket({
      intl: {
        languageMap
      }
    });
  });

  it('should return mapped language ids if mapping exists', function () {
    expect(utils.getMappedLanguage(mockGasket, 'a1-A1')).toEqual('a2-A2');
    expect(utils.getMappedLanguage(mockGasket, 'b1-B1')).toEqual('b2-B2');
  });
  it('should return the same language ids if mapping doesnt exist', function () {
    expect(utils.getMappedLanguage(mockGasket, 'c1-C1')).toEqual('c1-C1');
  });
});

describe('getFallbackLanguage', function () {
  it('returns fallback language', function () {
    expect(utils.getFallbackLanguage('hi-IN')).toEqual('hi');
    expect(utils.getFallbackLanguage('da')).toEqual('en-US');
    expect(utils.getFallbackLanguage('en')).toEqual(null);
    expect(utils.getFallbackLanguage('')).toEqual('en-US');
    expect(utils.getFallbackLanguage()).toEqual('en-US');
  });
});

describe('getAvailableLanguages', () => {
  let results, mockManifest;
  beforeAll(() => {
    mockManifest = {
      '__default__': 'test-app',
      'test-app': {
        'en': 'enenenen1',
        'en-US': 'aaaaaaa',
        'hi': 'hihihihi1',
        'hi-IN': 'bbbbbbb',
        'zh-CN': 'cncncnc',
        'zh-TW': 'twtwtwt',
        'bad': null
      }
    };
  });

  it('returns a Set', () => {
    results = utils.getAvailableLanguages(mockManifest);
    expect(results).toBeInstanceOf(Set);
  });

  it('contains expected locales from manifest', () => {
    const expectedLocales = [
      'en',
      'en-US',
      'hi',
      'hi-IN',
      'zh-CN',
      'zh-TW'
    ];
    results = utils.getAvailableLanguages(mockManifest);
    expect(expectedLocales).toEqual(Array.from(results));
  });

  it('does not contain unexpected locales', () => {
    results = utils.getAvailableLanguages(mockManifest);
    expect(results.has('unexpected')).toEqual(false);
    expect(results.has('bad')).toEqual(false);
  });

  it('does not contain __default__ key', () => {
    results = utils.getAvailableLanguages(mockManifest);
    expect(results.has('__default__')).toEqual(false);
  });

  it('does not contain module keys', () => {
    results = utils.getAvailableLanguages(mockManifest);
    expect(results.has('test-app')).toEqual(false);
  });
});

describe('createGetLanguage', () => {
  const mockGasket = setupGasket({
    intl: {
      outputDir: './some/build/dir',
      languageMap: { 'zh-BOGUS': 'zh-TW' }
    }
  });
  it('returns a getLanguage function', () => {
    const result = utils.createGetLanguage(mockGasket);

    expect(result).toBeInstanceOf(Function);
    expect(result.name).toEqual('getLanguage');
  });

  describe('getLanguage', () => {
    let result, getLanguage;

    beforeEach(() => {
      getLanguage = utils.createGetLanguage(mockGasket);
    });

    it('gets language from the redux state', () => {
      const state = { intl: { language: 'hi-IN' } };
      result = getLanguage({
        store: {
          getState: jest.fn().mockReturnValue(state)
        }
      });
      expect(result).toEqual('hi-IN');
    });

    it('returns mapped language', () => {
      const state = { intl: { language: 'zh-BOGUS' } };
      result = getLanguage({
        store: {
          getState: jest.fn().mockReturnValue(state)
        }
      });
      expect(result).toEqual('zh-TW');
    });

    it('returns fallback if language not available', () => {
      const state = { intl: { language: 'hi-BOGUS' } };
      result = getLanguage({
        store: {
          getState: jest.fn().mockReturnValue(state)
        }
      });
      expect(result).toEqual('hi');
    });

    it('returns default if no language set', () => {
      const state = { intl: {} };
      result = getLanguage({
        store: {
          getState: jest.fn().mockReturnValue(state)
        }
      });
      expect(result).toEqual('en-US');
    });

    it('returns default if language not supported', () => {
      const state = { intl: { language: 'en' } };
      result = getLanguage({
        store: {
          getState: jest.fn().mockReturnValue(state)
        }
      });
      expect(result).toEqual('en-US');
    });
  });
});
