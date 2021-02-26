const assume = require('assume');
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
      delete require.cache[require.resolve('./fixtures/mock-manifest.json')];
    });

    const localesParentDir = path.resolve(__dirname, 'fixtures');

    it('throws in browser', async function () {
      const call = () => utils.serverLoadData('/locales/extra', 'en-US', localesParentDir);
      assume(call).throws('Not available in browser');
    });
  });
});
