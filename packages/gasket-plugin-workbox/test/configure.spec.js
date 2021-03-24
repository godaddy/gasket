const utils = require('../lib/utils');
const configure = require('../lib/configure');

describe('configure', () => {
  let results, mockGasket;

  beforeAll(() => {
    mockGasket = {
      logger: {
        warning: jest.fn()
      },
      config: {
        root: '/some-root'
      }
    };
  });

  it('returns config with workbox settings', async () => {
    results = await configure(mockGasket, mockGasket.config);
    expect(results).toHaveProperty('workbox');
  });

  it('retains base config settings', async () => {
    results = await configure(mockGasket,
      { ...mockGasket.config, bogus: 'BOGUS' });
    expect(results).toHaveProperty('bogus', 'BOGUS');
  });

  it('sets defaults', async () => {
    results = await configure(mockGasket, mockGasket.config);
    expect(results.workbox).toEqual(expect.objectContaining({
      ...utils.defaultConfig,
      config: {
        ...utils.defaultConfig.config,
        importScripts: expect.any(Array)
      }
    }));
  });

  it('sets library version', async () => {
    results = await configure(mockGasket, mockGasket.config);
    expect(results.workbox).
      toHaveProperty('libraryVersion', expect.stringContaining('workbox-v'));
  });

  it('add library script to imports', async () => {
    results = await configure(mockGasket, mockGasket.config);
    expect(results.workbox.config).toHaveProperty('importScripts',
      expect.arrayContaining([
        expect.stringContaining('_workbox/workbox-v'),
        expect.stringContaining('workbox-sw.js')
      ]));
  });

  it('configures basePath with deprecated assetPrefix', async function () {
    mockGasket.config.workbox = {
      assetPrefix: '/some/prefix'
    };
    results = await configure(mockGasket, mockGasket.config);
    expect(results.workbox).toHaveProperty('basePath', '/some/prefix');
    expect(mockGasket.logger.warning).toHaveBeenCalledWith('DEPRECATED workbox config `assetPrefix` - use `basePath`');
  });

  it('add basePath to script path', async () => {
    mockGasket.config.workbox = {
      basePath: '/some/prefix'
    };
    results = await configure(mockGasket, mockGasket.config);
    expect(results.workbox.config).toHaveProperty('importScripts',
      expect.arrayContaining([
        expect.stringContaining('/some/prefix'),
        expect.stringContaining('_workbox/workbox'),
        expect.stringContaining('workbox-sw.js')
      ]));
  });

  it('allows workbox settings to be customized by user', async () => {
    results = await configure(mockGasket, {
      ...mockGasket.config,
      workbox: {
        config: {
          globStrict: true
        }
      }
    });
    expect(results.workbox).toHaveProperty('config', expect.any(Object));
    expect(results.workbox.config).toHaveProperty('globStrict', true);
  });
});
