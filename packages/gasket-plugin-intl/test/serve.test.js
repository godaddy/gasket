const mockServeStaticStub = jest.fn();

jest.mock('serve-static', () => mockServeStaticStub);

const serveHook = require('../lib/serve');

describe('express', function () {
  let mockGasket, mockApp;

  beforeEach(() => {
    mockApp = {
      use: jest.fn(),
      get: jest.fn()
    };

    mockGasket = {
      config: {
        root: process.cwd(),
        intl: {
          defaultLocale: 'en',
          defaultPath: '/locales',
          localesMap: {},
          localesDir: './public/locales',
          manifestFilename: 'mock-manifest.json'
        }
      }
    };
  });

  it('should not call app.use() without serveStatic set', function () {
    serveHook(mockGasket, mockApp);
    expect(mockApp.use).not.toHaveBeenCalled();
  });

  it('should set staticPath to defaultPath', function () {
    mockGasket.config.intl.serveStatic = true;
    serveHook(mockGasket, mockApp);
    expect(mockApp.use.mock.calls[0][0]).toEqual(mockGasket.config.intl.defaultPath);
  });

  it('should set staticPath to custom path', function () {
    mockGasket.config.intl.serveStatic = '/custom-path';
    serveHook(mockGasket, mockApp);
    expect(mockApp.use.mock.calls[0][0]).toEqual(mockGasket.config.intl.serveStatic);
  });

  it('static serves from configured localesDir', function () {
    mockGasket.config.intl.serveStatic = true;
    serveHook(mockGasket, mockApp);
    expect(mockServeStaticStub.mock.calls[0][0]).toEqual(mockGasket.config.intl.localesDir);
  });

  it('uses expected static serve settings', function () {
    mockGasket.config.intl.serveStatic = true;
    serveHook(mockGasket, mockApp);
    expect(mockServeStaticStub.mock.calls[0][1]).toEqual({
      index: false,
      maxAge: '1y',
      immutable: true
    });
  });
});
