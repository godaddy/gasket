/* eslint-disable no-sync */
const assume = require('assume');
const utils = require('../lib/utils');

const setupGasket = config => ({
  config: {
    root: '/some-root',
    ...config
  }
});

describe('getIntlConfig', () => {

  it('returns intl config from gasket.config.js', () => {
    const results = utils.getIntlConfig(setupGasket({
      intl: {
        assetPrefix: 'BOGUS'
      }
    }));
    assume(results).eqls({
      assetPrefix: 'BOGUS'
    });
  });

  it('returns empty object if no intl config set', () => {
    const results = utils.getIntlConfig({});
    assume(results).eqls({});
  });
});

// describe('getAssetPrefix', () => {
//
//   it('returns the assetPrefix from intl config', () => {
//     const results = utils.getAssetPrefix(setupGasket({
//       intl: {
//         assetPrefix: '//cdn-a'
//       }
//     }));
//     assume(results).equals('//cdn-a');
//   });
//
//   it('returns the assetPrefix from zone config', () => {
//     const results = utils.getAssetPrefix(setupGasket({
//       zone: '//cdn-b'
//     }));
//     assume(results).equals('//cdn-b');
//   });
//
//   it('returns the assetPrefix from intl config over next', () => {
//     const results = utils.getAssetPrefix(setupGasket({
//       intl: {
//         assetPrefix: '//cdn-a'
//       },
//       zone: '//cdn-b'
//     }));
//     assume(results).equals('//cdn-a');
//   });
//
//   it('returns empty string if not configured', () => {
//     const results = utils.getAssetPrefix(setupGasket({}));
//     assume(results).equals('');
//   });
// });
//
// describe('getIntlLanguageMap', () => {
//
//   it('returns object from config', () => {
//     const results = utils.getIntlLanguageMap(setupGasket({
//       intl: {
//         languageMap: {
//           A: 'B'
//         }
//       }
//     }));
//     assume(results).equals({ A: 'B' });
//   });
//
//   it('returns empty object if not configured', () => {
//     const results = utils.getIntlLanguageMap(setupGasket({}));
//     assume(results).equals({});
//   });
// });
//
// describe('getDefaultLocale', () => {
//
//   it('returns object from config', () => {
//     const results = utils.getDefaultLocale(setupGasket({
//       intl: {
//         defaultLocale: 'fr-FR'
//       }
//     }));
//     assume(results).equals('fr-FR');
//   });
//
//   it('returns en-US if not configured', () => {
//     const results = utils.getDefaultLocale(setupGasket({}));
//     assume(results).equals('en-US');
//   });
// });
//
// describe('getOutputDir', () => {
//
//   it('returns full outputDir from config', () => {
//     const results = utils.getOutputDir(setupGasket({
//       intl: {
//         outputDir: './some/build/dir'
//       }
//     }));
//     assume(results).equals('/some-root/some/build/dir');
//   });
//
//   it('returns default if not configured', () => {
//     const results = utils.getOutputDir(setupGasket({}));
//     assume(results).equals('/some-root/build/locales');
//   });
// });
//
//
// describe('getMappedLanguage', function () {
//   let mockGasket;
//
//   beforeEach(() => {
//     const languageMap = { 'a1-A1': 'a2-A2', 'b1-B1': 'b2-B2' };
//     mockGasket = setupGasket({
//       intl: {
//         languageMap
//       }
//     });
//   });
//
//   it('should return mapped language ids if mapping exists', function () {
//     assume(utils.getMappedLanguage(mockGasket, 'a1-A1')).equals('a2-A2');
//     assume(utils.getMappedLanguage(mockGasket, 'b1-B1')).equals('b2-B2');
//   });
//   it('should return the same language ids if mapping doesnt exist', function () {
//     assume(utils.getMappedLanguage(mockGasket, 'c1-C1')).equals('c1-C1');
//   });
// });
//
// describe('getFallbackLanguage', function () {
//   it('returns fallback language', function () {
//     assume(utils.getFallbackLanguage('hi-IN')).equals('hi');
//     assume(utils.getFallbackLanguage('da')).equals('en-US');
//     assume(utils.getFallbackLanguage('en')).equals(null);
//     assume(utils.getFallbackLanguage('')).equals('en-US');
//     assume(utils.getFallbackLanguage()).equals('en-US');
//   });
// });
//
// describe('getAvailableLanguages', () => {
//   let results, mockManifest;
//   beforeAll(() => {
//     mockManifest = {
//       '__default__': 'test-app',
//       'test-app': {
//         'en': 'enenenen1',
//         'en-US': 'aaaaaaa',
//         'hi': 'hihihihi1',
//         'hi-IN': 'bbbbbbb',
//         'zh-CN': 'cncncnc',
//         'zh-TW': 'twtwtwt',
//         'bad': null
//       }
//     };
//   });
//
//   it('returns a Set', () => {
//     results = utils.getAvailableLanguages(mockManifest);
//     assume(results).toBeInstanceOf(Set);
//   });
//
//   it('contains expected locales from manifest', () => {
//     const expectedLocales = [
//       'en',
//       'en-US',
//       'hi',
//       'hi-IN',
//       'zh-CN',
//       'zh-TW'
//     ];
//     results = utils.getAvailableLanguages(mockManifest);
//     assume(expectedLocales).equals(Array.from(results));
//   });
//
//   it('does not contain unexpected locales', () => {
//     results = utils.getAvailableLanguages(mockManifest);
//     assume(results.has('unexpected')).equals(false);
//     assume(results.has('bad')).equals(false);
//   });
//
//   it('does not contain __default__ key', () => {
//     results = utils.getAvailableLanguages(mockManifest);
//     assume(results.has('__default__')).equals(false);
//   });
//
//   it('does not contain module keys', () => {
//     results = utils.getAvailableLanguages(mockManifest);
//     assume(results.has('test-app')).equals(false);
//   });
// });
//
// describe('createGetLocale', () => {
//   const mockGasket = setupGasket({
//     intl: {
//       outputDir: './some/build/dir',
//       languageMap: { 'zh-BOGUS': 'zh-TW' }
//     }
//   });
//   it('returns a getLanguage function', () => {
//     const result = utils.createGetLocale(mockGasket);
//
//     assume(result).toBeInstanceOf(Function);
//     assume(result.name).equals('getLanguage');
//   });
//
//   describe('getLanguage', () => {
//     let result, getLanguage;
//
//     beforeEach(() => {
//       getLanguage = utils.createGetLocale(mockGasket);
//     });
//
//     it('gets language from the redux state', () => {
//       const state = { intl: { language: 'hi-IN' } };
//       result = getLanguage({
//         store: {
//           getState: jest.fn().mockReturnValue(state)
//         }
//       });
//       assume(result).equals('hi-IN');
//     });
//
//     it('returns mapped language', () => {
//       const state = { intl: { language: 'zh-BOGUS' } };
//       result = getLanguage({
//         store: {
//           getState: jest.fn().mockReturnValue(state)
//         }
//       });
//       assume(result).equals('zh-TW');
//     });
//
//     it('returns fallback if language not available', () => {
//       const state = { intl: { language: 'hi-BOGUS' } };
//       result = getLanguage({
//         store: {
//           getState: jest.fn().mockReturnValue(state)
//         }
//       });
//       assume(result).equals('hi');
//     });
//
//     it('returns default if no language set', () => {
//       const state = { intl: {} };
//       result = getLanguage({
//         store: {
//           getState: jest.fn().mockReturnValue(state)
//         }
//       });
//       assume(result).equals('en-US');
//     });
//
//     it('returns default if language not supported', () => {
//       const state = { intl: { language: 'en' } };
//       result = getLanguage({
//         store: {
//           getState: jest.fn().mockReturnValue(state)
//         }
//       });
//       assume(result).equals('en-US');
//     });
//   });
// });
