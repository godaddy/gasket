const workbox = require('./workbox');
const defaultConfig = require('./default-config');
const { encodeLocaleUrls } = workbox;

jest.mock('fs');

describe('workbox', () => {
  let result, mockGasket, mockConfig, mockReq;

  beforeEach(() => {
    const state = { intl: defaultConfig };
    mockGasket = {
      config: {
        root: '/some-root',
        intl: defaultConfig
      }
    };
    mockConfig = {};
    mockReq = {
      store: {
        getState: jest.fn().mockReturnValue(state)
      }
    };
  });

  it('returns workbox config partial', async () => {
    result = await workbox(mockGasket, mockConfig, mockReq);

    expect(result).toBeInstanceOf(Object);
  });

  it('config partial contains expected properties', async () => {
    result = await workbox(mockGasket, mockConfig, mockReq);

    expect(result).toHaveProperty('globDirectory', '.');
    expect(result).toHaveProperty('globPatterns', expect.any(Array));
    expect(result).toHaveProperty('modifyURLPrefix', expect.any(Object));
    expect(result).toHaveProperty('manifestTransforms', expect.any(Array));
  });

  it('config modifies urls from to _next', async () => {
    result = await workbox(mockGasket, mockConfig, mockReq);

    expect(result.modifyURLPrefix).toHaveProperty(
      'build/locales/', '_locales/'
    );
  });

  it('config modifies urls to use assetPrefix URL with trailing slash', async () => {
    const zone = 'https://some-cdn.com/';
    mockGasket.config = { zone };
    result = await workbox(mockGasket, mockConfig, mockReq);

    expect(result.modifyURLPrefix).toHaveProperty(
      'build/locales/', zone + '_locales/'
    );
  });

  it('config modifies urls to use assetPrefix URL without trailing slash', async () => {
    const zone = 'https://some-cdn.com';
    mockGasket.config = { zone };
    result = await workbox(mockGasket, mockConfig, mockReq);

    expect(result.modifyURLPrefix).toHaveProperty(
      'build/locales/', zone + '/_locales/'
    );
  });

  it('config modifies urls to use assetPrefix relative path with trailing slash', async () => {
    const zone = '/some/asset/prefix/';
    mockGasket.config = { zone };
    result = await workbox(mockGasket, mockConfig, mockReq);

    expect(result.modifyURLPrefix).toHaveProperty(
      'build/locales/', zone + '_locales/'
    );
  });

  it('config modifies urls to use assetPrefix relative path without trailing slash', async () => {
    const zone = '/some/asset/prefix';
    mockGasket.config = { zone };
    result = await workbox(mockGasket, mockConfig, mockReq);

    expect(result.modifyURLPrefix).toHaveProperty(
      'build/locales/', zone + '/_locales/'
    );
  });

  it('manifestTransforms contains an encodeLocaleUrls function', async () => {
    const zone = 'https://some-cdn.com/';
    mockGasket.config = { zone };
    result = await workbox(mockGasket, mockConfig, mockReq);

    expect(result.manifestTransforms).toEqual([encodeLocaleUrls]);
  });

  describe('encodeLocaleUrls', () => {
    let mockEntry, mockManifest;

    beforeEach(() => {
      mockEntry = {
        url: 'some/asset.json'
      };
      mockManifest = [mockEntry];
    });

    it('returns an object with manifest property', () => {
      result = encodeLocaleUrls([]);
      expect(result).toEqual(expect.any(Object));
      expect(result.manifest).toEqual(expect.any(Array));
    });

    it('does not adjust non-locale files', () => {
      result = encodeLocaleUrls(mockManifest);
      expect(result.manifest[0].url).toBe('some/asset.json');
    });

    it('encodes module part of relative locale path', () => {
      mockEntry.url = '_locales/@org/mod-name/ns1/ggggggg.en-US.json';
      const expected = '_locales/%40org%2Fmod-name%2Fns1/ggggggg.en-US.json';
      result = encodeLocaleUrls(mockManifest);
      expect(result.manifest[0].url).toBe(expected);
    });

    it('encodes module part of asset prefixed locale path', () => {
      mockEntry.url = 'https://some.cdn/path/_locales/@org/mod-name/ns1/ggggggg.en-US.json';
      const expected = '_locales/%40org%2Fmod-name%2Fns1';
      result = encodeLocaleUrls(mockManifest);
      expect(result.manifest[0].url).toContain(expected);
    });
  });
});
