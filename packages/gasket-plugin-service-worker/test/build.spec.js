const mkdirp = require('mkdirp');
const build = require('../lib/build');
const fs = require('fs');

jest.mock('fs', () => {
  const originalModule = jest.requireActual('fs');

  return {
    ...originalModule,
    promises: {
      writeFile: jest.fn(() =>  Promise.resolve(null))
    }
  };
});

describe('build', () => {
  let mockConfig, mockGasket;

  beforeEach(() => {

    mockConfig = {
      url: '/sw.js',
      scope: '/',
      content: '',
      cacheKeys: [],
      cache: {},
      staticOutput: '/some-root/public/sw.js'
    };

    mockGasket = {
      config: {
        root: '/some-root',
        serviceWorker: mockConfig
      },
      logger: {
        log: jest.fn()
      },
      execWaterfall: jest.fn()
    };
  });

  it('is configured with expected timing', function () {
    expect(build).toHaveProperty('timing', {
      last: true
    });
  });

  it('does not build if staticOutput not configured', async () => {
    delete mockConfig.staticOutput;
    await build.handler(mockGasket);
    expect(mockGasket.execWaterfall).not.toHaveBeenCalled();
  });

  it('executes execWaterfall for composeServiceWorker', async () => {
    mockConfig.content = 'This is preconfigured content';
    await build.handler(mockGasket);
    expect(mockGasket.execWaterfall).toHaveBeenCalledWith(
      'composeServiceWorker',
      mockConfig.content,
      expect.objectContaining({})
    );
  });

  it('uses mkdirp to ensure directory exists', async () => {
    mockConfig.content = 'This is preconfigured content';
    await build.handler(mockGasket);
    expect(mkdirp).toHaveBeenCalledWith('/some-root/public');
  });

  it('writes file out', async () => {
    mockConfig.content = 'This is preconfigured content';
    await build.handler(mockGasket);
    expect(fs.promises.writeFile).toHaveBeenCalledWith(
      '/some-root/public/sw.js',
      expect.stringContaining('strict'),
      'utf-8'
    );
  });
});
