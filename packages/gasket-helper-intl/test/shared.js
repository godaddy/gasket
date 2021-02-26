const assume = require('assume');
const sinon = require('sinon');

module.exports = function sharedTests(UtilClass) {
  let utils, mockConfig;

  beforeEach(function () {
    sinon.stub(console, 'error');
    mockConfig = {
      manifest: require('./fixtures/mock-manifest.json')
    };
    utils = new UtilClass(mockConfig);
  });

  afterEach(function () {
    delete require.cache[require.resolve('./fixtures/mock-manifest.json')];
    sinon.restore();
  });

  describe('.formatLocalePath', function () {
    it('adds locale json to root path', function () {
      const results = utils.formatLocalePath('/locales', 'en-US');
      assume(results).equals('/locales/en-US.json');
    });

    it('substitutes $locale in path template', function () {
      const results = utils.formatLocalePath('/locales/$locale/page1.json', 'en-US');
      assume(results).equals('/locales/en-US/page1.json');
    });

    it('substitutes :locale in path template', function () {
      const results = utils.formatLocalePath('/locales/:locale/page1.json', 'en-US');
      assume(results).equals('/locales/en-US/page1.json');
    });

    it('substitutes {locale} in path template', function () {
      const results = utils.formatLocalePath('/locales/{locale}/page1.json', 'en-US');
      assume(results).equals('/locales/en-US/page1.json');
    });

    it('ensures forward slash', function () {
      const results = utils.formatLocalePath('locales', 'en-US');
      assume(results).equals('/locales/en-US.json');
    });

    it('ensures no extra end slash', function () {
      const results = utils.formatLocalePath('locales/', 'en-US');
      assume(results).equals('/locales/en-US.json');
    });
  });

  describe('.pathToUrl', function () {
    it('add hash to url', function () {
      const results = utils.pathToUrl('/locales/en-US.json');
      assume(results).equals('/locales/en-US.json?v=10decbe');
    });

    it('does not add hash if localePath not in manifest', function () {
      const results = utils.pathToUrl('/missing/en-US.json');
      assume(results).equals('/missing/en-US.json');
    });

    it('returns url WITH base path', function () {
      mockConfig.basePath = '/bogus';
      utils = new UtilClass(mockConfig);
      const results = utils.pathToUrl('/locales/en-US.json');
      assume(results).equals('/bogus/locales/en-US.json?v=10decbe');
    });

    it('ignores trailing slash from basePath', function () {
      mockConfig.basePath = '/bogus/';
      utils = new UtilClass(mockConfig);
      const results = utils.pathToUrl('/locales/en-US.json');
      assume(results).equals('/bogus/locales/en-US.json?v=10decbe');
    });

    it('basePath can be a full URL', function () {
      mockConfig.basePath = 'https://bogus.com/';
      utils = new UtilClass(mockConfig);
      const results = utils.pathToUrl('/locales/en-US.json');
      assume(results).equals('https://bogus.com/locales/en-US.json?v=10decbe');
    });
  });

  describe('.getLocalePath', function () {
    it('returns formatted localePath', function () {
      const results = utils.getLocalePath('/locales', 'en-US');
      assume(results).equals('/locales/en-US.json');
    });

    it('falls back to lang if no localePath with region', function () {
      mockConfig.manifest.paths['/locales/da.json'] = 'hash1234';
      utils = new UtilClass(mockConfig);
      const results = utils.getLocalePath('/locales', 'da-DK');
      assume(results).equals('/locales/da.json');
    });

    it('falls back to lang if no localePath with script and region', function () {
      mockConfig.manifest.paths['/locales/az.json'] = 'hash1234';
      utils = new UtilClass(mockConfig);
      const results = utils.getLocalePath('/locales', 'az-Cyrl-AZ');
      assume(results).equals('/locales/az.json');
    });

    it('falls back to default locale if no localePath for locale', function () {
      mockConfig.manifest.defaultLocale = 'fake';
      mockConfig.manifest.paths['/locales/fake.json'] = 'hash1234';
      utils = new UtilClass(mockConfig);
      const results = utils.getLocalePath('/locales', 'da-DK');
      assume(results).equals('/locales/fake.json');
    });

    it('returns localePath for mapped locales', function () {
      mockConfig.manifest.paths['/locales/fake.json'] = 'hash1234';
      mockConfig.manifest.localesMap = { 'da-DK': 'fake' };
      utils = new UtilClass(mockConfig);
      const results = utils.getLocalePath('/locales', 'da-DK');
      assume(results).equals('/locales/fake.json');
    });
  });
};
