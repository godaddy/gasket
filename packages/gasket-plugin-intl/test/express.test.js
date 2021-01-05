const assume = require('assume');
const sinon = require('sinon');
const expressHook = require('../lib/express');

describe('express', function () {
  let mockGasket, mockApp;

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
          manifestFilename: 'mock-manifest.json',
          outputDir: '/test-output-dir'
        }
      }
    };
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
});
