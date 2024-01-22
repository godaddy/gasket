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
    const results = utils.getWorkboxConfig(setupGasket({}));
    expect(results).toEqual({ ...utils.defaultConfig });
  });
});

describe('getBasePath', () => {

  it('returns the basePath from workbox config', () => {
    const results = utils.getBasePath(setupGasket({
      workbox: {
        basePath: '//cdn-a'
      }
    }));
    expect(results).toEqual('//cdn-a');
  });

  it('returns the basePath from next config', () => {
    const results = utils.getBasePath(setupGasket({
      basePath: '//cdn-b'
    }));
    expect(results).toEqual('//cdn-b');
  });

  it('returns empty string if not configured', () => {
    const results = utils.getBasePath(setupGasket({}));
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
