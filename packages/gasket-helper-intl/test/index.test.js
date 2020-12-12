const assume = require('assume');
const sinon = require('sinon');
const path = require('path');

const mockManifest = require('./fixtures/mock-manifest.json');
const mockConfig = {};

const { LocaleUtils } = require('../lib/index');

describe('LocaleUtils', function () {
  let utils;

  beforeEach(function () {
    sinon.stub(console, 'error');
    mockConfig.manifest = { ...mockManifest, paths: { ...mockManifest.paths } };
    utils = new LocaleUtils(mockConfig);
  });

  afterEach(function () {
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
      utils = new LocaleUtils(mockConfig);
      const results = utils.pathToUrl('/locales/en-US.json');
      assume(results).equals('/bogus/locales/en-US.json?v=10decbe');
    });

    it('ignores trailing slash from basePath', function () {
      mockConfig.basePath = '/bogus/';
      utils = new LocaleUtils(mockConfig);
      const results = utils.pathToUrl('/locales/en-US.json');
      assume(results).equals('/bogus/locales/en-US.json?v=10decbe');
    });

    it('basePath can be a full URL', function () {
      mockConfig.basePath = 'https://bogus.com/';
      utils = new LocaleUtils(mockConfig);
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
      utils = new LocaleUtils(mockConfig);
      const results = utils.getLocalePath('/locales', 'da-DK');
      assume(results).equals('/locales/da.json');
    });

    it('falls back to lang if no localePath with script and region', function () {
      mockConfig.manifest.paths['/locales/az.json'] = 'hash1234';
      utils = new LocaleUtils(mockConfig);
      const results = utils.getLocalePath('/locales', 'az-Cyrl-AZ');
      assume(results).equals('/locales/az.json');
    });

    it('falls back to default locale if no localePath for locale', function () {
      mockConfig.manifest.defaultLocale = 'fake';
      mockConfig.manifest.paths['/locales/fake.json'] = 'hash1234';
      utils = new LocaleUtils(mockConfig);
      const results = utils.getLocalePath('/locales', 'da-DK');
      assume(results).equals('/locales/fake.json');
    });

    it('returns localePath for mapped locales', function () {
      mockConfig.manifest.paths['/locales/fake.json'] = 'hash1234';
      mockConfig.manifest.localesMap = { 'da-DK': 'fake' };
      utils = new LocaleUtils(mockConfig);
      const results = utils.getLocalePath('/locales', 'da-DK');
      assume(results).equals('/locales/fake.json');
    });
  });

  describe('.serverLoadData', function () {

    const localesParentDir = path.resolve(__dirname, 'fixtures');

    it('returns localesProps for other path part', async function () {
      const results = utils.serverLoadData('/locales/extra', 'en-US', localesParentDir);
      assume(results).eqls({
        locale: 'en-US',
        messages: { 'en-US': { gasket_extra: 'Extra' } },
        status: { '/locales/extra/en-US.json': 'loaded' }
      });
    });

    it('returns localesProps for multiple locale path parts', async function () {
      const results = utils.serverLoadData(['/locales', '/locales/extra'], 'en-US', localesParentDir);
      assume(results).eqls({
        locale: 'en-US',
        messages: { 'en-US': { gasket_welcome: 'Hello!', gasket_learn: 'Learn Gasket', gasket_extra: 'Extra' } },
        status: {
          '/locales/en-US.json': 'loaded',
          '/locales/extra/en-US.json': 'loaded'
        }
      });
    });

    it('returns localesProps with error for missing path', async function () {
      const results = utils.serverLoadData('/locales/missing', 'en-US', localesParentDir);
      assume(results).eqls({
        locale: 'en-US',
        messages: { 'en-US': {} },
        status: { '/locales/missing/en-US.json': 'error' }
      });
      assume(console.error).is.calledWithMatch('Cannot find module');
    });

    it('returns localesProps for default if locale missing', async function () {
      const results = utils.serverLoadData('/locales', 'fr-CA', localesParentDir);
      assume(results).eqls({
        locale: 'fr-CA',
        messages: { 'fr-CA': { gasket_welcome: 'Hello!', gasket_learn: 'Learn Gasket' } },
        status: { '/locales/en-US.json': 'loaded' }
      });
    });
  });
});
