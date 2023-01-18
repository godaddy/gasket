const path = require('path');

const { LocaleUtils } = require('../lib/server');

describe('LocaleUtils (Server)', function () {
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
      delete require.cache[require.resolve('./fixtures/mock-manifest.json')];
    });

    const localesParentDir = path.resolve(__dirname, 'fixtures');

    it('returns localesProps for other path part', async function () {
      const results = utils.serverLoadData('/locales/extra', 'en-US', localesParentDir);
      expect(results).toEqual({
        locale: 'en-US',
        messages: { 'en-US': { gasket_extra: 'Extra' } },
        status: { '/locales/extra/en-US.json': 'loaded' }
      });
    });

    it('returns localesProps for multiple locale path parts', async function () {
      const results = utils.serverLoadData(['/locales', '/locales/extra'], 'en-US', localesParentDir);
      expect(results).toEqual({
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
      expect(results).toEqual({
        locale: 'en-US',
        messages: { 'en-US': {} },
        status: { '/locales/missing/en-US.json': 'error' }
      });
      // eslint-disable-next-line no-console
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Cannot find module'));
    });

    it('returns localesProps for default if locale missing', async function () {
      const results = utils.serverLoadData('/locales', 'fr-CA', localesParentDir);
      expect(results).toEqual({
        locale: 'fr-CA',
        messages: { 'fr-CA': { gasket_welcome: 'Hello!', gasket_learn: 'Learn Gasket' } },
        status: { '/locales/en-US.json': 'loaded' }
      });
    });

    it('handles thunks for locale paths', function () {
      const mockContext = { extra: true };
      const mockThunk = jest.fn().mockImplementation((context) => context.extra ? '/locales/extra' : '/locales');

      const results = utils.serverLoadData(mockThunk, 'en-US', localesParentDir, mockContext);
      expect(mockThunk).toHaveBeenCalled();
      expect(results).toEqual({
        locale: 'en-US',
        messages: { 'en-US': { gasket_extra: 'Extra' } },
        status: { '/locales/extra/en-US.json': 'loaded' }
      });
    });
  });
});
