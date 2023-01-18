/* eslint-disable jest/no-export */
module.exports = function sharedTests(UtilClass) {
  let utils, mockConfig;

  beforeEach(function () {
    jest.spyOn(console, 'error');
    mockConfig = {
      manifest: require('./fixtures/mock-manifest.json')
    };
    utils = new UtilClass(mockConfig);
  });

  afterEach(function () {
    jest.resetModules();
  });

  describe('.formatLocalePath', function () {
    it('adds locale json to root path', function () {
      const results = utils.formatLocalePath('/locales', 'en-US');
      expect(results).toEqual('/locales/en-US.json');
    });

    it('substitutes $locale in path template', function () {
      const results = utils.formatLocalePath('/locales/$locale/page1.json', 'en-US');
      expect(results).toEqual('/locales/en-US/page1.json');
    });

    it('substitutes :locale in path template', function () {
      const results = utils.formatLocalePath('/locales/:locale/page1.json', 'en-US');
      expect(results).toEqual('/locales/en-US/page1.json');
    });

    it('substitutes {locale} in path template', function () {
      const results = utils.formatLocalePath('/locales/{locale}/page1.json', 'en-US');
      expect(results).toEqual('/locales/en-US/page1.json');
    });

    it('ensures forward slash', function () {
      const results = utils.formatLocalePath('locales', 'en-US');
      expect(results).toEqual('/locales/en-US.json');
    });

    it('ensures no extra end slash', function () {
      const results = utils.formatLocalePath('locales/', 'en-US');
      expect(results).toEqual('/locales/en-US.json');
    });
  });

  describe('.pathToUrl', function () {
    it('add hash to url', function () {
      const results = utils.pathToUrl('/locales/en-US.json');
      expect(results).toEqual('/locales/en-US.json?v=10decbe');
    });

    it('does not add hash if localePath not in manifest', function () {
      const results = utils.pathToUrl('/missing/en-US.json');
      expect(results).toEqual('/missing/en-US.json');
    });

    it('returns url WITH base path', function () {
      mockConfig.basePath = '/bogus';
      utils = new UtilClass(mockConfig);
      const results = utils.pathToUrl('/locales/en-US.json');
      expect(results).toEqual('/bogus/locales/en-US.json?v=10decbe');
    });

    it('ignores trailing slash from basePath', function () {
      mockConfig.basePath = '/bogus/';
      utils = new UtilClass(mockConfig);
      const results = utils.pathToUrl('/locales/en-US.json');
      expect(results).toEqual('/bogus/locales/en-US.json?v=10decbe');
    });

    it('basePath can be a full URL', function () {
      mockConfig.basePath = 'https://bogus.com/';
      utils = new UtilClass(mockConfig);
      const results = utils.pathToUrl('/locales/en-US.json');
      expect(results).toEqual('https://bogus.com/locales/en-US.json?v=10decbe');
    });
  });

  describe('.resolveLocalePathPart', function () {
    it('handles thunks for locale paths', function () {
      const mockContext = { customRoot: '/bogus' };
      const mockThunk = jest.fn().mockImplementation((context) => context.customRoot + '/locales');
      const results = utils.resolveLocalePathPart(mockThunk, mockContext);
      expect(results).toEqual('/bogus/locales');
      expect(mockThunk).toHaveBeenCalled();
    });
  });

  describe('.getLocalePath', function () {
    it('returns formatted localePath', function () {
      const results = utils.getLocalePath('/locales', 'en-US');
      expect(results).toEqual('/locales/en-US.json');
    });

    it('falls back to lang if no localePath with region', function () {
      mockConfig.manifest.paths['locales/da.json'] = 'hash1234';
      utils = new UtilClass(mockConfig);
      const results = utils.getLocalePath('/locales', 'da-DK');
      expect(results).toEqual('/locales/da.json');
    });

    it('falls back to lang if no localePath with script and region', function () {
      mockConfig.manifest.paths['locales/az.json'] = 'hash1234';
      utils = new UtilClass(mockConfig);
      const results = utils.getLocalePath('/locales', 'az-Cyrl-AZ');
      expect(results).toEqual('/locales/az.json');
    });

    it(
      'falls back to default locale if no localePath for locale if ' +
      'language matches before falling back to language',
      function () {
        mockConfig.manifest.defaultLocale = 'en-US';
        mockConfig.manifest.paths['locales/en-US.json'] = 'hash1234';
        mockConfig.manifest.paths['locales/en.json'] = 'hash4321';
        utils = new UtilClass(mockConfig);
        const results = utils.getLocalePath('/locales', 'en-CA');
        expect(results).toEqual('/locales/en-US.json');
      }
    );

    it('falls back to default locale if no localePath for locale', function () {
      mockConfig.manifest.defaultLocale = 'fake';
      mockConfig.manifest.paths['locales/fake.json'] = 'hash1234';
      utils = new UtilClass(mockConfig);
      const results = utils.getLocalePath('/locales', 'da-DK');
      expect(results).toEqual('/locales/fake.json');
    });

    it('falls back to default locale if requested locale does not exist in locales config', function () {
      mockConfig.manifest.defaultLocale = 'fake';
      mockConfig.manifest.paths['locales/fake.json'] = 'hash1234';
      mockConfig.manifest.locales = ['not-this', 'or-this'];
      utils = new UtilClass(mockConfig);
      const results = utils.getLocalePath('/locales', 'da-DK');
      expect(results).toEqual('/locales/fake.json');
    });

    it('does not fallback to default locale if requested locale exists in locales config', function () {
      mockConfig.manifest.defaultLocale = 'fake';
      mockConfig.manifest.locales = ['da-DK'];
      utils = new UtilClass(mockConfig);
      const results = utils.getLocalePath('/locales', 'da-DK');
      expect(results).toEqual('/locales/da-DK.json');
    });

    it('returns localePath for mapped locales', function () {
      mockConfig.manifest.paths['locales/fake.json'] = 'hash1234';
      mockConfig.manifest.localesMap = { 'da-DK': 'fake' };
      utils = new UtilClass(mockConfig);
      const results = utils.getLocalePath('/locales', 'da-DK');
      expect(results).toEqual('/locales/fake.json');
    });

    it('handles thunks for locale paths', function () {
      const mockContext = { customRoot: '/bogus' };
      const mockThunk = jest.fn().mockImplementation((context) => context.customRoot + '/locales');
      const results = utils.getLocalePath(mockThunk, 'en-US', mockContext);
      expect(results).toEqual('/bogus/locales/en-US.json');
      expect(mockThunk).toHaveBeenCalled();
    });
  });
};
