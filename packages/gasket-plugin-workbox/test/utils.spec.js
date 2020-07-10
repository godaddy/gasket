const utils = require('../lib/utils');

const setupGasket = config => ({
  config: {
    root: '/some-root',
    ...config
  }
});

describe('getWorkboxConfig', () => {

  it('returns defaults', () => {
    const results = utils.getWorkboxConfig(setupGasket({}));
    expect(results).toEqual(utils.defaultConfig);
  });

  it('returns config from gasket.config.js', () => {
    const results = utils.getWorkboxConfig(setupGasket({
      workbox: {
        assetPrefix: 'BOGUS'
      }
    }));
    expect(results).toEqual({
      ...utils.defaultConfig,
      assetPrefix: 'BOGUS'
    });
  });
});

describe('getAssetPrefix', () => {

  it('returns the assetPrefix from workbox config', () => {
    const results = utils.getAssetPrefix(setupGasket({
      workbox: {
        assetPrefix: '//cdn-a'
      }
    }));
    expect(results).toEqual('//cdn-a');
  });

  it('returns the assetPrefix from next config', () => {
    const results = utils.getAssetPrefix(setupGasket({
        zone: '//cdn-b'
    }));
    expect(results).toEqual('//cdn-b');
  });

  it('returns the assetPrefix from workbox config over next', () => {
    const results = utils.getAssetPrefix(setupGasket({
      workbox: {
        assetPrefix: '//cdn-a'
      },
      zone: '//cdn-b'
    }));
    expect(results).toEqual('//cdn-a');
  });

  it('returns empty string if not configured', () => {
    const results = utils.getAssetPrefix(setupGasket({}));
    expect(results).toEqual('');
  });
});

describe('getOutputDir', () => {

  it('returns full outputDir from config', () => {
    const results = utils.getOutputDir(setupGasket({
      workbox: {
        outputDir: './some/build/dir'
      }
    }));
    expect(results).toEqual('/some-root/some/build/dir');
  });

  it('returns default if not configured', () => {
    const results = utils.getOutputDir(setupGasket({}));
    expect(results).toEqual('/some-root/build/workbox');
  });
});
