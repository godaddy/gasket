import * as utils from './Utils';

describe('Utils', function () {
  let localeMap, mockState;

  beforeEach(() => {
    mockState = {
      LocaleApi: {
        getLocaleManifest: {
          isLoaded: true,
          value: localeMap
        }
      },
      intl: {
        languageMap: {
          'zh-SG': 'zh-CN',
          'zh-HK': 'zh-TW'
        },
        defaultLanguage: 'aa-ZZ',
        language: 'en-US'
      }
    };

    localeMap = {
      '__default__': 'test-app',
      'test-app': {
        'en': 'enenenen1',
        'en-US': 'aaaaaaa',
        'hi': 'hihihihi1',
        'hi-IN': 'bbbbbbb',
        'zh-CN': 'cncncnc',
        'zh-TW': 'twtwtwt',
        'a.b.o.u.t': {
          'en': 'enenenen2',
          'en-US': 'ccccccc',
          'hi': 'hihihihi2',
          'hi-IN': 'ddddddd',
          'zh-CN': 'cncncn2',
          'zh-TW': 'twtwtw2'
        },
        'common': {
          'en': 'enenenen3',
          'en-US': 'eeeeeee',
          'hi': 'hihihihi3',
          'hi-IN': 'fffffff',
          'zh-CN': 'cncncn3',
          'zh-TW': 'twtwtw3'
        }
      },
      '@org/mod-name': {
        'en': 'enenenen4',
        'en-US': 'ggggggg',
        'hi': 'hihihihi4',
        'hi-IN': 'hhhhhhh',
        'zh-CN': 'cncncn4',
        'zh-TW': 'twtwtw4',
        'ns1': {
          'en': 'enenenen5',
          'en-US': 'iiiiiii',
          'hi': 'hihihihi5',
          'hi-IN': 'jjjjjjj',
          'zh-CN': 'cncncn5',
          'zh-TW': 'twtwtw5'
        },
        'ns2': {
          'en': 'enenenen6',
          'en-US': 'kkkkkkk',
          'hi': 'hihihihi6',
          'hi-IN': 'lllllll',
          'zh-CN': 'cncncn6',
          'zh-TW': 'twtwtw6'
        }
      }
    };
  });
  describe('#getAvailableLanguage', function () {
    it('should return proper language from the manifest', function () {
      expect(utils.getAvailableLanguage(mockState, localeMap, 'en-US', 'test-app', '')).toEqual('en-US');
      expect(utils.getAvailableLanguage(mockState, localeMap, 'en-US', 'test-app', 'a.b.o.u.t')).toEqual('en-US');
      expect(utils.getAvailableLanguage(mockState, localeMap, 'en-GB', 'test-app', '')).toEqual('en');
      expect(utils.getAvailableLanguage(mockState, localeMap, 'en-GB', 'test-app', 'a.b.o.u.t')).toEqual('en');
      expect(utils.getAvailableLanguage(mockState, localeMap, 'es-ES', 'test-app', '')).toEqual('en-US');
      expect(utils.getAvailableLanguage(mockState, localeMap, 'es-ES', 'test-app', 'a.b.o.u.t')).toEqual('en-US');
      expect(utils.getAvailableLanguage(mockState, localeMap, 'hi-IN', 'test-app', '')).toEqual('hi-IN');
      expect(utils.getAvailableLanguage(mockState, localeMap, 'hi-IN', 'test-app', 'a.b.o.u.t')).toEqual('hi-IN');
    });
    it('should return en-US if non-english language does not exist', function () {
      expect(utils.getAvailableLanguage(mockState, localeMap, 'es-XX', 'test-app', '')).toEqual('en-US');
    });
    it('should return default language if localeMap is unavailable', function () {
      expect(utils.getAvailableLanguage(mockState, null, 'xx-XX', 'test-app', '')).toEqual('aa-ZZ');
    });
    it('should return default language if english language does not exist', function () {
      delete localeMap['test-app'].en;
      expect(utils.getAvailableLanguage(mockState, localeMap, 'en-IN', 'test-app', '')).toEqual('aa-ZZ');
    });
    it('should return mapped language if language is mapped', function () {
      expect(utils.getAvailableLanguage(mockState, localeMap, 'zh-HK', 'test-app', '')).toEqual('zh-TW');
      expect(utils.getAvailableLanguage(mockState, localeMap, 'zh-SG', 'test-app', '')).toEqual('zh-CN');
    });
  });

  describe('#getLocaleFileName', function () {
    it('should return proper file name with app-name and namespace', function () {
      expect(utils.getLocaleFileName(mockState, localeMap, 'hi-IN', 'test-app', 'common')).toEqual('fffffff.hi-IN.json');
      expect(utils.getLocaleFileName(mockState, localeMap, 'hi-IN', 'test-app', 'a.b.o.u.t')).toEqual('ddddddd.hi-IN.json');
      expect(utils.getLocaleFileName(mockState, localeMap, 'hi-IN', '@org/mod-name', 'ns1')).toEqual('jjjjjjj.hi-IN.json');
    });
    it('should return proper file name with app-name only', function () {
      expect(utils.getLocaleFileName(mockState, localeMap, 'hi-IN', 'test-app', '')).toEqual('bbbbbbb.hi-IN.json');
      expect(utils.getLocaleFileName(mockState, localeMap, 'hi-IN', '@org/mod-name', '')).toEqual('hhhhhhh.hi-IN.json');
    });
    it('should return default file name with hashes if invalid app-name or namespace name', function () {
      expect(utils.getLocaleFileName(mockState, localeMap, 'hi-IN', 'invalid-app', 'common')).toEqual('aa-ZZ.json');
      expect(utils.getLocaleFileName(mockState, localeMap, 'hi-IN', 'test-app', 'invalid-namespace')).toEqual('aa-ZZ.json');
    });
  });

  describe('#getIdentifierParts', function () {
    it('should return proper app name and namespace name depending on string input', function () {
      expect(utils.getIdentifierParts('')).toEqual({ module: '', namespace: '' });
      expect(utils.getIdentifierParts('default')).toEqual({ module: 'default', namespace: '' });
      expect(utils.getIdentifierParts('test-app')).toEqual({ module: 'test-app', namespace: '' });

      expect(utils.getIdentifierParts('.namespace')).toEqual({ module: '', namespace: 'namespace' });
      expect(utils.getIdentifierParts('default.namespace')).toEqual({ module: 'default', namespace: 'namespace' });
      expect(utils.getIdentifierParts('test-app.namespace')).toEqual({ module: 'test-app', namespace: 'namespace' });
      expect(utils.getIdentifierParts('test-app.name.space.with.many.dots'))
        .toEqual({ module: 'test-app', namespace: 'name.space.with.many.dots' });
      expect(utils.getIdentifierParts('.name.space.with.many.dots'))
        .toEqual({ module: '', namespace: 'name.space.with.many.dots' });

      expect(utils.getIdentifierParts('@org/module-name')).toEqual({ module: '@org/module-name', namespace: '' });
      expect(utils.getIdentifierParts('@org/module-name.namespace'))
        .toEqual({ module: '@org/module-name', namespace: 'namespace' });
    });
    it('should return proper app name and namespace name depending on object input', function () {
      expect(utils.getIdentifierParts({})).toEqual({ module: '', namespace: '' });
      expect(utils.getIdentifierParts({ module: '' })).toEqual({ module: '', namespace: '' });
      expect(utils.getIdentifierParts({ module: 'default' })).toEqual({ module: 'default', namespace: '' });
      expect(utils.getIdentifierParts({ namespace: 'testns' })).toEqual({ module: '', namespace: 'testns' });
      expect(utils.getIdentifierParts({ module: 'default', namespace: 'testns' }))
        .toEqual({ module: 'default', namespace: 'testns' });
    });
  });

  describe('#getParamsForIdentifiers', function () {

    it('should return proper module and locale file for string input', function () {
      expect(utils.getParamsForIdentifiers(mockState))
        .toEqual([{ module: 'test-app', localeFile: 'aaaaaaa.en-US.json' }]);
      expect(utils.getParamsForIdentifiers(mockState, ''))
        .toEqual([{ module: 'test-app', localeFile: 'aaaaaaa.en-US.json' }]);
      expect(utils.getParamsForIdentifiers(mockState, 'default'))
        .toEqual([{ module: 'test-app', localeFile: 'aaaaaaa.en-US.json' }]);
      expect(utils.getParamsForIdentifiers(mockState, 'test-app'))
        .toEqual([{ module: 'test-app', localeFile: 'aaaaaaa.en-US.json' }]);
      expect(utils.getParamsForIdentifiers(mockState, '@org/mod-name'))
        .toEqual([{ module: '@org/mod-name', localeFile: 'ggggggg.en-US.json' }]);

      expect(utils.getParamsForIdentifiers(mockState, '.common'))
        .toEqual([{ module: 'test-app/common', localeFile: 'eeeeeee.en-US.json' }]);
      expect(utils.getParamsForIdentifiers(mockState, 'default.common'))
        .toEqual([{ module: 'test-app/common', localeFile: 'eeeeeee.en-US.json' }]);
      expect(utils.getParamsForIdentifiers(mockState, 'test-app.common'))
        .toEqual([{ module: 'test-app/common', localeFile: 'eeeeeee.en-US.json' }]);
      expect(utils.getParamsForIdentifiers(mockState, '@org/mod-name.ns2'))
        .toEqual([{ module: '@org/mod-name/ns2', localeFile: 'kkkkkkk.en-US.json' }]);
    });

    it('should return proper module and locale file for object input', function () {
      expect(utils.getParamsForIdentifiers(mockState, {}))
        .toEqual([{ module: 'test-app', localeFile: 'aaaaaaa.en-US.json' }]);
      expect(utils.getParamsForIdentifiers(mockState, { module: 'default' }))
        .toEqual([{ module: 'test-app', localeFile: 'aaaaaaa.en-US.json' }]);
      expect(utils.getParamsForIdentifiers(mockState, { module: 'test-app' }))
        .toEqual([{ module: 'test-app', localeFile: 'aaaaaaa.en-US.json' }]);
      expect(utils.getParamsForIdentifiers(mockState, { module: '@org/mod-name' }))
        .toEqual([{ module: '@org/mod-name', localeFile: 'ggggggg.en-US.json' }]);

      expect(utils.getParamsForIdentifiers(mockState, { namespace: 'common' }))
        .toEqual([{ module: 'test-app/common', localeFile: 'eeeeeee.en-US.json' }]);
      expect(utils.getParamsForIdentifiers(mockState, { module: 'default', namespace: 'common' }))
        .toEqual([{ module: 'test-app/common', localeFile: 'eeeeeee.en-US.json' }]);
      expect(utils.getParamsForIdentifiers(mockState, { module: 'test-app', namespace: 'common' }))
        .toEqual([{ module: 'test-app/common', localeFile: 'eeeeeee.en-US.json' }]);
      expect(utils.getParamsForIdentifiers(mockState, { module: '@org/mod-name', namespace: 'ns2' }))
        .toEqual([{ module: '@org/mod-name/ns2', localeFile: 'kkkkkkk.en-US.json' }]);
    });
  });

  describe('#getFallbackLanguage', function () {
    it('returns fallback language', function () {
      expect(utils.getFallbackLanguage('hi-IN')).toEqual('hi');
      expect(utils.getFallbackLanguage('da')).toEqual('en-US');
      expect(utils.getFallbackLanguage('en')).toEqual(null);
      expect(utils.getFallbackLanguage('')).toEqual('en-US');
      expect(utils.getFallbackLanguage()).toEqual('en-US');
    });
  });

  describe('#getLanguageMap', function () {
    it('should return empty object if intl settings not available', function () {
      expect(utils.getLanguageMap({})).toEqual({});
    });
    it('should return empty object if language map not available', function () {
      expect(utils.getLanguageMap({ intl: {} })).toEqual({});
    });
    it('should return language map settings if available', function () {
      const languageMap = { 'a1-A1': 'a2-A2' };
      expect(utils.getLanguageMap({ intl: { languageMap } })).toEqual(languageMap);
    });
  });

  describe('#getDefaultLanguage', function () {
    it('should return en-US if intl settings not available', function () {
      expect(utils.getDefaultLanguage({})).toEqual('en-US');
    });
    it('should return en-US if default language not specified', function () {
      expect(utils.getDefaultLanguage({ intl: {} })).toEqual('en-US');
    });
    it('should return default language if available', function () {
      const defaultLanguage = 'aa-XX';
      expect(utils.getDefaultLanguage({ intl: { defaultLanguage } })).toEqual(defaultLanguage);
    });
  });

  describe('#getMappedLanguage', function () {
    let languageMap, mockState2;

    beforeEach(() => {
      languageMap = { 'a1-A1': 'a2-A2', 'b1-B1': 'b2-B2' };
      mockState2 = {
        intl: {
          languageMap
        }
      };
    });

    it('should return mapped language ids if mapping exists', function () {
      expect(utils.getMappedLanguage(mockState2, 'a1-A1')).toEqual('a2-A2');
      expect(utils.getMappedLanguage(mockState2, 'b1-B1')).toEqual('b2-B2');
    });
    it('should return the same languages if mapping doesnt exist', function () {
      expect(utils.getMappedLanguage(mockState2, 'c1-C1')).toEqual('c1-C1');
    });
  });

  describe('#selectLanguage', function () {

    it('selects language from redux state', function () {
      expect(utils.selectLanguage(mockState)).toEqual('en-US');

      mockState.intl.language = 'fr-FR';
      expect(utils.selectLanguage(mockState)).toEqual('fr-FR');
    });

    it('falls back to default if language not on state', function () {
      delete mockState.intl.language;
      expect(utils.selectLanguage(mockState)).toEqual('aa-ZZ');
    });

    it('falls back to default if intl not on state', function () {
      delete mockState.intl;
      expect(utils.selectLanguage(mockState)).toEqual('en-US');
    });
  });
});
