const assume = require('assume');
const workbox = require('../lib/workbox');
const { makeEncodeLocaleUrls } = workbox;

describe('workbox', () => {
  let result, mockGasket, mockConfig, mockReq, mockRes;

  beforeEach(() => {
    mockGasket = {
      config: {
        root: '/path/to/root',
        intl: {
          basePath: '',
          localesPath: '/locales',
          localesDir: '/path/to/root/public/locales'
        }
      }
    };
    mockConfig = {};
    mockReq = {};
    mockRes = {
      gasketData: {
        intl: {
          locale: 'en-US'
        }
      }
    };
  });

  it('returns workbox config partial', async () => {
    result = await workbox(mockGasket, mockConfig, mockReq, mockRes);

    assume(result).instanceOf(Object);
  });

  it('config partial contains expected properties', async () => {
    result = await workbox(mockGasket, mockConfig, mockReq, mockRes);

    assume(result).property('globDirectory', '.');
    assume(result).property('globPatterns');
    assume(result).property('modifyURLPrefix');
    assume(result).property('manifestTransforms');
  });

  it('config modifies urls from to _next', async () => {
    result = await workbox(mockGasket, mockConfig, mockReq, mockRes);

    assume(result.modifyURLPrefix).property(
      'public/locales', 'locales'
    );
  });

  it('config modifies urls to use assetPrefix URL with trailing slash', async () => {
    mockGasket.config.intl.basePath = 'https://some-cdn.com/';
    result = await workbox(mockGasket, mockConfig, mockReq, mockRes);

    assume(result.modifyURLPrefix).property(
      'public/locales', 'https://some-cdn.com/locales'
    );
  });

  it('config modifies urls to use assetPrefix URL without trailing slash', async () => {
    mockGasket.config.intl.basePath = 'https://some-cdn.com';
    result = await workbox(mockGasket, mockConfig, mockReq, mockRes);

    assume(result.modifyURLPrefix).property(
      'public/locales', 'https://some-cdn.com/locales'
    );
  });

  it('config modifies urls to use assetPrefix relative path with trailing slash', async () => {
    mockGasket.config.intl.basePath = '/some/asset/prefix/';
    result = await workbox(mockGasket, mockConfig, mockReq, mockRes);

    assume(result.modifyURLPrefix).property(
      'public/locales', '/some/asset/prefix/locales'
    );
  });

  it('config modifies urls to use assetPrefix relative path without trailing slash', async () => {
    mockGasket.config.intl.basePath = '/some/asset/prefix';
    result = await workbox(mockGasket, mockConfig, mockReq, mockRes);

    assume(result.modifyURLPrefix).property(
      'public/locales', '/some/asset/prefix/locales'
    );
  });

  it('manifestTransforms contains an encodeLocaleUrls function', async () => {
    result = await workbox(mockGasket, mockConfig, mockReq, mockRes);

    assume(result.manifestTransforms).instanceOf(Array);
    assume(result.manifestTransforms[0]).property('name', 'encodeLocaleUrls');
  });

  describe('makeEncodeLocaleUrls', () => {
    let encodeLocaleUrls, mockEntry, mockManifest;

    beforeEach(() => {
      mockEntry = {
        url: 'some/asset.json'
      };
      mockManifest = [mockEntry];
      encodeLocaleUrls = makeEncodeLocaleUrls('/locales');
    });

    it('returns an object with manifest property', () => {
      result = encodeLocaleUrls([]);
      assume(result).eqls({ manifest: [] });
      assume(result.manifest).eqls([]);
    });

    it('does not adjust non-locale files', () => {
      result = encodeLocaleUrls(mockManifest);
      assume(result.manifest[0].url).equals('some/asset.json');
    });

    it('encodes module part of relative locale path', () => {
      mockEntry.url = '/locales/@org/mod-name/ns1/ggggggg.en-US.json';
      const expected = '/locales/%40org%2Fmod-name%2Fns1/ggggggg.en-US.json';
      result = encodeLocaleUrls(mockManifest);
      assume(result.manifest[0].url).equals(expected);
    });

    it('encodes module part of asset prefixed locale path', () => {
      mockEntry.url = 'https://some.cdn/path/locales/@org/mod-name/ns1/ggggggg.en-US.json';
      const expected = '/locales/%40org%2Fmod-name%2Fns1';
      result = encodeLocaleUrls(mockManifest);
      assume(result.manifest[0].url).includes(expected);
    });
  });
});
