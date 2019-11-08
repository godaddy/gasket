const fs = require('fs');
const utils = require('../lib/utils');
const configure = require('../lib/configure');

jest.mock('fs');

describe('configure', () => {
  let results, mockGasket;

  beforeAll(() => {
    mockGasket = {
      config: {
        root: '/some-root'
      }
    };

    fs.__setMockFiles([
      'workbox-v4.1.0',
      'some-other-dir'
    ]);
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
      toHaveProperty('libraryVersion', expect.stringContaining('workbox'));
  });

  it('add library script to imports', async () => {
    results = await configure(mockGasket, mockGasket.config);
    expect(results.workbox.config).toHaveProperty('importScripts',
      expect.arrayContaining([
        expect.stringContaining('_workbox/workbox'),
        expect.stringContaining('workbox-sw.js')
      ]));
  });

  it('add assetPrefix to script path', async () => {
    mockGasket.config.workbox = {
      assetPrefix: '/some/prefix'
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
