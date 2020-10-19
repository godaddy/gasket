const composeServiceWorker = require('../lib/compose-service-worker');
const utils = require('../lib/utils');
const { generateSWString, __setWarnings } = require('workbox-build');

describe('composeServiceWorker', () => {
  const expectedComment = 'Welcome to your Workbox-powered service worker!';
  const expectedCode = 'workbox.precaching.precacheAndRoute';

  let results, mockGasket, mockContent, mockReq, mockRes;

  beforeEach(() => {
    mockGasket = {
      config: {
        root: '/some-root',
        workbox: utils.defaultConfig
      },
      exec: jest.fn().mockResolvedValue([
        { configA: 'one' },
        { configB: 'two' }
      ]),
      logger: {
        warning: jest.fn()
      }
    };
    mockContent = '/* mock sw content */';
    mockReq = {};
    mockRes = {};
    __setWarnings([]);
  });

  it('executes exec for workbox', async () => {
    await composeServiceWorker(mockGasket, mockContent, mockReq, mockRes);
    expect(mockGasket.exec).toHaveBeenCalledWith(
      'workbox',
      utils.defaultConfig.config,
      mockReq,
      mockRes
    );
  });

  it('executes generateSWString with merged config', async () => {
    await composeServiceWorker(mockGasket, mockContent, mockReq, mockRes);
    expect(generateSWString).toHaveBeenCalledWith(
      expect.objectContaining({
        ...utils.defaultConfig.config,
        configA: 'one',
        configB: 'two'
      }));
  });

  it('appends generated workbox service worker content', async () => {
    results = await composeServiceWorker(mockGasket, mockContent, mockReq, mockRes);
    expect(results).toContain(mockContent);
    expect(results).toContain(expectedCode);
  });

  it('strips comments from workbox generated content', async () => {
    const withComments = await generateSWString();
    expect(withComments.swString).toContain(expectedComment);

    results = await composeServiceWorker(mockGasket, mockContent, mockReq, mockRes);
    expect(results).not.toContain(expectedComment);
    expect(results).toContain(expectedCode);
  });

  it('does not call logger if no warnings', async () => {
    results = await composeServiceWorker(mockGasket, mockContent, mockReq, mockRes);
    expect(mockGasket.logger.warning).not.toHaveBeenCalled();
  });

  it('logs warnings if they exists', async () => {
    const mockWarnings = ['something bad happened'];
    __setWarnings(mockWarnings);
    results = await composeServiceWorker(mockGasket, mockContent, mockReq, mockRes);
    expect(mockGasket.logger.warning).toHaveBeenCalledWith(mockWarnings);
  });
});
