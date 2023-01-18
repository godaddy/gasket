const workbox = require('../lib/workbox');
const { makeEncodeLocaleUrls } = workbox;

describe('workbox', function () {
  let result, mockGasket, mockConfig, mockContext;

  beforeEach(function () {
    mockGasket = {
      config: {
        root: '/path/to/root',
        intl: {
          basePath: '',
          defaultPath: '/locales',
          localesDir: '/path/to/root/public/locales'
        }
      }
    };
    mockConfig = {};
    mockContext = {
      req: {},
      res: {
        locals: {
          gasketData: {
            intl: {
              locale: 'en-US'
            }
          }
        }
      }
    };
  });

  it('returns workbox config partial', async function () {
    result = await workbox(mockGasket, mockConfig, mockContext);

    expect(result).toBeInstanceOf(Object);
    expect(result).not.toEqual({});
  });

  it('returns empty partial for static service workers', async function () {
    result = await workbox(mockGasket, mockConfig, {});

    expect(result).toBeInstanceOf(Object);
    expect(result).toEqual({});
  });

  it('config partial contains expected properties', async function () {
    result = await workbox(mockGasket, mockConfig, mockContext);

    expect(result).toHaveProperty('globDirectory', '.');
    expect(result).toHaveProperty('globPatterns');
    expect(result).toHaveProperty('modifyURLPrefix');
    expect(result).toHaveProperty('manifestTransforms');
  });

  it('config modifies urls from to _next', async function () {
    result = await workbox(mockGasket, mockConfig, mockContext);

    expect(result.modifyURLPrefix).toHaveProperty(
      'public/locales', 'locales'
    );
  });

  it('config modifies urls to use assetPrefix URL with trailing slash', async function () {
    mockGasket.config.intl.basePath = 'https://some-cdn.com/';
    result = await workbox(mockGasket, mockConfig, mockContext);

    expect(result.modifyURLPrefix).toHaveProperty(
      'public/locales', 'https://some-cdn.com/locales'
    );
  });

  it('config modifies urls to use assetPrefix URL without trailing slash', async function () {
    mockGasket.config.intl.basePath = 'https://some-cdn.com';
    result = await workbox(mockGasket, mockConfig, mockContext);

    expect(result.modifyURLPrefix).toHaveProperty(
      'public/locales', 'https://some-cdn.com/locales'
    );
  });

  it('config modifies urls to use assetPrefix relative path with trailing slash', async function () {
    mockGasket.config.intl.basePath = '/some/asset/prefix/';
    result = await workbox(mockGasket, mockConfig, mockContext);

    expect(result.modifyURLPrefix).toHaveProperty(
      'public/locales', '/some/asset/prefix/locales'
    );
  });

  it('config modifies urls to use assetPrefix relative path without trailing slash', async function () {
    mockGasket.config.intl.basePath = '/some/asset/prefix';
    result = await workbox(mockGasket, mockConfig, mockContext);

    expect(result.modifyURLPrefix).toHaveProperty(
      'public/locales', '/some/asset/prefix/locales'
    );
  });

  it('manifestTransforms contains an encodeLocaleUrls function', async function () {
    result = await workbox(mockGasket, mockConfig, mockContext);

    expect(result.manifestTransforms).toBeInstanceOf(Array);
    expect(result.manifestTransforms[0]).toHaveProperty('name', 'encodeLocaleUrls');
  });

  it('does not expect gasketData to be populated', async function () {
    delete mockContext.res.locals.gasketData;
    let error = null;

    try {
      await workbox(mockGasket, mockConfig, mockContext);
    } catch (err) {
      error = err;
    }

    expect(error).toEqual(null);
  });

  describe('makeEncodeLocaleUrls', function () {
    let encodeLocaleUrls, mockEntry, mockManifest;

    beforeEach(function () {
      mockEntry = {
        url: 'some/asset.json'
      };
      mockManifest = [mockEntry];
      encodeLocaleUrls = makeEncodeLocaleUrls('/locales');
    });

    it('returns an object with manifest toHaveProperty', function () {
      result = encodeLocaleUrls([]);
      expect(result).toEqual({ manifest: [] });
      expect(result.manifest).toEqual([]);
    });

    it('does not adjust non-locale files', function () {
      result = encodeLocaleUrls(mockManifest);
      expect(result.manifest[0].url).toEqual('some/asset.json');
    });

    it('encodes module part of relative locale path', function () {
      mockEntry.url = '/locales/@org/mod-name/ns1/ggggggg.en-US.json';
      const expected = '/locales/%40org%2Fmod-name%2Fns1/ggggggg.en-US.json';
      result = encodeLocaleUrls(mockManifest);
      expect(result.manifest[0].url).toEqual(expected);
    });

    it('encodes module part of asset prefixed locale path', function () {
      mockEntry.url = 'https://some.cdn/path/locales/@org/mod-name/ns1/ggggggg.en-US.json';
      const expected = '/locales/%40org%2Fmod-name%2Fns1';
      result = encodeLocaleUrls(mockManifest);
      expect(result.manifest[0].url).toContain(expected);
    });
  });
});
