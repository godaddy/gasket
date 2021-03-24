const assume = require('assume');
const sinon = require('sinon');
const proxyquire = require('proxyquire');


describe('express', function () {
  let mockGasket, mockApp, expressHook, serveStaticStub;

  beforeEach(() => {
    mockApp = {
      use: sinon.stub(),
      get: sinon.stub()
    };

    mockGasket = {
      config: {
        root: process.cwd(),
        intl: {
          defaultLocale: 'en',
          defaultPath: '/locales',
          localesMap: { },
          localesDir: './public/locales',
          manifestFilename: 'mock-manifest.json'
        }
      }
    };

    serveStaticStub = sinon.stub();

    expressHook = proxyquire('../lib/express', {
      'serve-static': serveStaticStub
    });
  });

  afterEach(function () {
    sinon.restore();
  });

  it('should not call app.use() without serveStatic set', function () {
    expressHook(mockGasket, mockApp);
    assume(mockApp.use).not.called();
  });

  it('should set staticPath to defaultPath', function () {
    mockGasket.config.intl.serveStatic = true;
    expressHook(mockGasket, mockApp);
    assume(mockApp.use.args[0][0]).eqls(mockGasket.config.intl.defaultPath);
  });

  it('should set staticPath to custom path', function () {
    mockGasket.config.intl.serveStatic = '/custom-path';
    expressHook(mockGasket, mockApp);
    assume(mockApp.use.args[0][0]).eqls(mockGasket.config.intl.serveStatic);
  });

  it('static serves from configured localesDir', function () {
    mockGasket.config.intl.serveStatic = true;
    expressHook(mockGasket, mockApp);
    assume(serveStaticStub.args[0][0]).eqls(mockGasket.config.intl.localesDir);
  });

  it('uses expected static serve settings', function () {
    mockGasket.config.intl.serveStatic = true;
    expressHook(mockGasket, mockApp);
    assume(serveStaticStub.args[0][1]).eqls({
      index: false,
      maxAge: '1y',
      immutable: true
    });
  });
});
