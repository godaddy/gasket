import { vi } from 'vitest';

let __warnings = [];
const __swString = `
/**
 * Welcome to your Workbox-powered service worker!
 *
 * You'll need to register this file in your web app and you should
 * disable HTTP caching for this file too.
 * See https://goo.gl/nhQhGp
 *
 * The rest of the code is auto-generated. Please don't update this file
 * directly; instead, make changes to your Workbox build configuration
 * and re-run your build process.
 * See https://goo.gl/2aRDsh
 */
 
importScripts(
  "_workbox/workbox-v4.1.0/workbox-sw.js"
);

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});


self.__precacheManifest = [].concat(self.__precacheManifest || []);
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});
`;

vi.mock('workbox-build', () => {
  const generateSWString = vi.fn(() => Promise.resolve({
    warnings: __warnings,
    swString: __swString
  }));
  const __setWarnings = warnings => {
    __warnings = warnings;
  };
  return {
    generateSWString,
    __setWarnings
  };
});

import composeServiceWorker from '../lib/compose-service-worker.js';
import { defaultConfig } from '../lib/utils.js';
import { generateSWString, __setWarnings } from 'workbox-build';

describe('composeServiceWorker', () => {
  const expectedComment = 'Welcome to your Workbox-powered service worker!';
  const expectedCode = 'workbox.precaching.precacheAndRoute';

  let results, mockGasket, mockContent, mockContext;

  beforeEach(() => {
    vi.clearAllMocks();
    mockGasket = {
      config: {
        root: '/some-root',
        workbox: defaultConfig
      },
      exec: vi
        .fn()
        .mockResolvedValue([{ configA: 'one' }, { configB: 'two' }]),
      logger: {
        warn: vi.fn()
      }
    };
    mockContent = '/* mock sw content */';
    mockContext = {};
    __setWarnings([]);
  });

  it('executes exec for workbox', async () => {
    await composeServiceWorker(mockGasket, mockContent, mockContext);
    expect(mockGasket.exec).toHaveBeenCalledWith(
      'workbox',
      defaultConfig.config,
      mockContext
    );
  });

  it('executes generateSWString with merged config', async () => {
    await composeServiceWorker(mockGasket, mockContent, mockContext);
    expect(generateSWString).toHaveBeenCalledWith(
      expect.objectContaining({
        ...defaultConfig.config,
        configA: 'one',
        configB: 'two'
      })
    );
  });

  it('appends generated workbox service worker content', async () => {
    results = await composeServiceWorker(mockGasket, mockContent, mockContext);
    expect(results).toContain(mockContent);
    expect(results).toContain(expectedCode);
  });

  it('strips comments from workbox generated content', async () => {
    const withComments = await generateSWString();
    expect(withComments.swString).toContain(expectedComment);

    results = await composeServiceWorker(mockGasket, mockContent, mockContext);
    expect(results).not.toContain(expectedComment);
    expect(results).toContain(expectedCode);
  });

  it('does not call logger if no warnings', async () => {
    results = await composeServiceWorker(mockGasket, mockContent, mockContext);
    expect(mockGasket.logger.warn).not.toHaveBeenCalled();
  });

  it('logs warnings if they exists', async () => {
    const mockWarnings = ['something bad happened'];
    __setWarnings(mockWarnings);
    results = await composeServiceWorker(mockGasket, mockContent, mockContext);
    expect(mockGasket.logger.warn).toHaveBeenCalledWith(mockWarnings);
  });
});
