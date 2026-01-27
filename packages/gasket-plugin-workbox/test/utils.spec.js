import { getWorkboxConfig, getBasePath, getOutputDir, defaultConfig } from '../lib/utils.js';

const setupGasket = config => ({
  config: {
    root: '/some-root',
    ...config
  }
});

describe('getWorkboxConfig', () => {

  it('returns defaults', () => {
    const results = getWorkboxConfig(setupGasket({}));
    expect(results).toEqual(defaultConfig);
  });

  it('returns config from gasket.js', () => {
    const results = getWorkboxConfig(setupGasket({}));
    expect(results).toEqual({ ...defaultConfig });
  });
});

describe('getBasePath', () => {

  it('returns the basePath from workbox config', () => {
    const results = getBasePath(setupGasket({
      workbox: {
        basePath: '//cdn-a'
      }
    }));
    expect(results).toEqual('//cdn-a');
  });

  it('returns the basePath from next config', () => {
    const results = getBasePath(setupGasket({
      basePath: '//cdn-b'
    }));
    expect(results).toEqual('//cdn-b');
  });

  it('returns empty string if not configured', () => {
    const results = getBasePath(setupGasket({}));
    expect(results).toEqual('');
  });
});

describe('getOutputDir', () => {

  it('returns full outputDir from config', () => {
    const results = getOutputDir(setupGasket({
      workbox: {
        outputDir: './some/build/dir'
      }
    }));
    expect(results).toEqual('/some-root/some/build/dir');
  });

  it('returns default if not configured', () => {
    const results = getOutputDir(setupGasket({}));
    expect(results).toEqual('/some-root/build/workbox');
  });
});
