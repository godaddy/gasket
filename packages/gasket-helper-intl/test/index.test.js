const path = require('path');

const { LocaleUtils } = require('../lib/index');

describe('LocaleUtils', function () {

  require('./shared')(LocaleUtils);

  describe('.serverLoadData', function () {
    let utils, mockConfig;

    beforeEach(function () {
      mockConfig = {
        manifest: require('./fixtures/mock-manifest.json')
      };
      utils = new LocaleUtils(mockConfig);
    });

    afterEach(function () {
      jest.resetModules();
    });

    const localesParentDir = path.resolve(__dirname, 'fixtures');

    it('throws in browser', async function () {
      const call = () => utils.serverLoadData('/locales/extra', 'en-US', localesParentDir);
      expect(call).toThrow('Not available in browser');
    });
  });

  describe('.getFallbackLocale', function () {
    let utils, mockConfig;

    beforeEach(function () {
      mockConfig = {
        manifest: require('./fixtures/mock-manifest.json')
      };
    });

    afterEach(function () {
      jest.resetModules();
    });

    [
      ['fr-CA', 'fr', 'en-US'],
      ['fr', 'en-US', 'en-US'],
      ['fr-CA', 'fr', 'en'],
      ['fr', 'en', 'en'],
      ['en-CA', 'en-US', 'en-US'],
      ['en-CA', 'en', 'en'],
      ['en-US', 'en', 'en-US'],
      ['en-US', 'en', 'en'],
      ['en', null, 'en-US'],
      ['en', null, 'en']
    ].forEach(
      function ([locale, expected, defaultLocale]) {
        it(
          `properly falls back to ${expected} when the locale is ${locale} and the default locale is ${defaultLocale}`,
          function () {
            mockConfig.manifest.defaultLocale = defaultLocale;
            utils = new LocaleUtils(mockConfig);

            const actual = utils.getFallbackLocale(locale);

            expect(actual).toEqual(expected);
          }
        );
      }
    );
  });
});
