/* eslint-disable no-sync */

const sinon = require('sinon');
const assume = require('assume');
const path = require('path');
const proxyquire = require('proxyquire').noCallThru();
const { devDependencies } = require('../package');

const { spy, stub } = sinon;

describe('Plugin', function () {
  const plugin = require('../');

  it('is an object', () => {
    assume(plugin).is.an('object');
  });

  it('has expected name', () => {
    assume(plugin).to.have.property('name', require('../package').name);
  });

  it('has expected hooks', () => {
    const expected = [
      'configure',
      'create',
      'express',
      'build',
      'workbox',
      'metadata'
    ];

    assume(plugin).to.have.property('hooks');

    const hooks = Object.keys(plugin.hooks);
    assume(hooks).eqls(expected);
    assume(hooks).is.length(expected.length);
  });
});

describe('configure hook', () => {
  const configureHook = require('../').hooks.configure.handler;

  it('adds the sw webpackRegister callback', () => {
    const gasket = mockGasketApi();
    const results = configureHook(gasket, gasket.config);
    assume(results).property('serviceWorker');
    assume(results.serviceWorker).property('webpackRegister');
    assume(results.serviceWorker.webpackRegister).is.a('function');
  });

  it('does not override the sw webpackRegister if exists', () => {
    const gasket = mockGasketApi();
    gasket.config.serviceWorker = { webpackRegister: 'hello' };
    const results = configureHook(gasket, gasket.config);
    assume(results.serviceWorker.webpackRegister).is.a('string');
  });

  it('webpackRegister callback only true for _app entries', () => {
    const gasket = mockGasketApi();
    const results = configureHook(gasket, gasket.config);
    const entryName = results.serviceWorker.webpackRegister;
    assume(entryName('bad')).equals(false);
    assume(entryName('_app')).equals(true);
    assume(entryName('static/runtime/_app')).equals(true);
  });

  it('fallback support for `next` from gasket.config', async () => {
    const gasket = mockGasketApi();
    delete gasket.config.nextConfig;
    gasket.config.next = {
      customConfig: true
    };
    const results = configureHook(gasket, gasket.config);
    assume(results.nextConfig).has.property('customConfig', true);
    assume(gasket.logger.warning).calledWithMatch('DEPRECATED');
  });
});

describe('express hook', () => {
  let next, nextHandler, plugin, expressApp, hook;

  beforeEach(() => {
    expressApp = {
      set: spy(),
      use: spy(),
      all: spy()
    };
    nextHandler = {
      prepare: stub().resolves(),
      getRequestHandler: stub().resolves({})
    };
    next = stub().returns(nextHandler);

    plugin = proxyquire('../', { next });
    hook = plugin.hooks.express.handler;
  });

  it('timing configured last', async function () {
    const gasket = mockGasketApi();
    await hook(gasket, expressApp, false);

    assume(plugin.hooks.express).property('timing');
    assume(plugin.hooks.express.timing).eqls({ last: true });
  });

  it('executes the `next` lifecycle', async function () {
    const gasket = mockGasketApi();
    await hook(gasket, expressApp, false);

    assume(gasket.exec).has.been.calledWith('next', nextHandler);
  });

  it('attaches middleware to set NEXT_LOCALE cookie', async function () {
    const gasket = mockGasketApi();
    await hook(gasket, expressApp, false);

    assume(expressApp.use).has.been.calledWith(sinon.match.func);
    const fn = expressApp.use.getCall(0).args[0];
    assume(fn.name).equals('setNextLocale');
  });

  it('middleware sets NEXT_LOCALE cookie from gasketData', async function () {
    const gasket = mockGasketApi();
    await hook(gasket, expressApp, false);

    const fn = expressApp.use.getCall(0).args[0];

    const mockReq = { headers: {} };
    const mockRes = { locals: { gasketData: { intl: { locale: 'fr-FR' } } } };
    const mockNext = stub();
    fn(mockReq, mockRes, mockNext);
    assume(mockReq.headers).has.property('cookie', ';NEXT_LOCALE=fr-FR');
  });

  it('middleware adds NEXT_LOCALE to existing cookie', async function () {
    const gasket = mockGasketApi();
    await hook(gasket, expressApp, false);

    const fn = expressApp.use.getCall(0).args[0];

    const mockReq = { headers: { cookie: 'bogus=data' } };
    const mockRes = { locals: { gasketData: { intl: { locale: 'fr-FR' } } } };
    const mockNext = stub();
    fn(mockReq, mockRes, mockNext);
    assume(mockReq.headers).has.property('cookie', 'bogus=data;NEXT_LOCALE=fr-FR');
  });

  it('middleware does not set NEXT_LOCALE cookie if no gasketData', async function () {
    const gasket = mockGasketApi();
    await hook(gasket, expressApp, false);

    const fn = expressApp.use.getCall(0).args[0];

    const mockReq = { headers: {} };
    const mockRes = { locals: { gasketData: { } } };
    const mockNext = stub();
    fn(mockReq, mockRes, mockNext);
    assume(mockReq.headers).not.has.property('cookie');
  });

  it('executes the `nextExpress` lifecycle', async function () {
    const gasket = mockGasketApi();
    await hook(gasket, expressApp, false);

    assume(gasket.exec).has.been.calledWith('nextExpress', { next: nextHandler, express: expressApp });
  });

  it('does not derive a webpack config if not running a dev server', async () => {
    await hook(mockGasketApi(), expressApp, false);

    const nextOptions = next.lastCall.args[0];
    assume(nextOptions.conf).to.not.haveOwnProperty('webpack');
  });
});

describe('create hook', () => {
  let mockContext;
  const plugin = require('../');
  const root = path.join(__dirname, '..');

  beforeEach(() => {

    mockContext = {
      pkg: {
        add: spy(),
        has: spy()
      },
      files: { add: spy() },
      gasketConfig: {
        add: spy()
      }
    };
  });

  it('has expected timings', async function () {
    assume(plugin.hooks.create.timing.before).eqls([
      '@gasket/plugin-intl'
    ]);
    assume(plugin.hooks.create.timing.after).eqls([
      '@gasket/plugin-redux'
    ]);
  });

  it('adds the appropriate globs', async function () {
    await plugin.hooks.create.handler({}, mockContext);

    assume(mockContext.files.add).calledWith(
      `${root}/generator/app/.*`,
      `${root}/generator/app/*`,
      `${root}/generator/app/**/*`
    );
  });

  it('adds the appropriate globs for mocha', async function () {
    mockContext.testPlugin = '@gasket/mocha';
    await plugin.hooks.create.handler({}, mockContext);

    assume(mockContext.files.add).calledWith(
      `${root}/generator/mocha/*`,
      `${root}/generator/mocha/**/*`
    );
  });

  it('adds the appropriate globs for jest', async function () {
    mockContext.testPlugin = '@gasket/jest';
    await plugin.hooks.create.handler({}, mockContext);

    assume(mockContext.files.add).calledWith(
      `${root}/generator/jest/*`,
      `${root}/generator/jest/**/*`
    );
  });

  it('adds appropriate dependencies', async function () {
    await plugin.hooks.create.handler({}, mockContext);

    assume(mockContext.pkg.add).calledWith('dependencies', {
      '@gasket/assets': devDependencies['@gasket/assets'],
      '@gasket/nextjs': devDependencies['@gasket/nextjs'],
      'next': devDependencies.next,
      'prop-types': devDependencies['prop-types'],
      'react': devDependencies.react,
      'react-dom': devDependencies['react-dom']
    });
  });

  it('adds the appropriate globs for redux', async function () {
    mockContext.pkg.has = stub().callsFake((o, f) => o === 'dependencies' && f === '@gasket/redux');
    await plugin.hooks.create.handler({}, mockContext);

    assume(mockContext.files.add).calledWith(
      `${root}/generator/redux/*`,
      `${root}/generator/redux/**/*`
    );
  });

  it('adds appropriate dependencies for redux', async function () {
    mockContext.pkg.has = stub().callsFake((o, f) => o === 'dependencies' && f === '@gasket/redux');
    await plugin.hooks.create.handler({}, mockContext);

    assume(mockContext.pkg.add).calledWith('dependencies', {
      'next-redux-wrapper': devDependencies['next-redux-wrapper'],
      'lodash.merge': devDependencies['lodash.merge']
    });
  });

  it('adds webpack5 support to nextConfig in gasket.config', async function () {
    await plugin.hooks.create.handler({}, mockContext);

    assume(mockContext.gasketConfig.add).calledWith('nextConfig', {
      future: { webpack5: true }
    });
  });
});

describe('build hook', () => {

  let createConfigStub, builderStub;

  const getMockedBuildHook = (imports = {}) => {
    createConfigStub = stub();
    builderStub = stub();

    return proxyquire('../', {
      './config': {
        createConfig: createConfigStub
      },
      'next/dist/build': {
        default: builderStub
      },
      ...imports
    }).hooks.build;
  };

  it('does not build for local command', async () => {
    const buildHook = getMockedBuildHook();
    await buildHook({ command: { id: 'local' } });
    assume(builderStub).not.called();
  });

  it('uses current next build', async () => {
    const buildHook = getMockedBuildHook();
    await buildHook({ command: { id: 'build' } });
    assume(builderStub).called();
  });

  it('supports older gasket.command format', async () => {
    const buildHook = getMockedBuildHook();
    await buildHook({ command: 'local' });
    assume(builderStub).not.called();
  });
});

describe('workbox hook', () => {

  let gasketAPI, plugin;

  beforeEach(() => {
    gasketAPI = mockGasketApi();
    plugin = require('../');
  });

  it('returns workbox config partial', async () => {
    const results = await plugin.hooks.workbox(gasketAPI);

    assume(results).to.be.an('object');
  });

  it('config partial contains expected properties', async () => {
    const results = await plugin.hooks.workbox(gasketAPI);

    assume(results).to.have.property('globDirectory', '.');
    assume(results).to.have.property('globPatterns');
    assume(results).to.have.property('modifyURLPrefix');
  });

  it('config modifies urls from to _next', async () => {
    const results = await plugin.hooks.workbox(gasketAPI);

    assume(results.modifyURLPrefix).to.have.property('.next/', '_next/');
  });

  it('config modifies urls to use base path with https', async () => {
    const basePath = 'https://some-cdn.com/';
    gasketAPI.config = { basePath };
    const results = await plugin.hooks.workbox(gasketAPI);
    assume(results.modifyURLPrefix).to.have.property('.next/', basePath + '_next/');
  });

  it('config modifies urls to use base path with http', async () => {
    const basePath = 'http://some-cdn.com/';
    gasketAPI.config = { basePath };
    const results = await plugin.hooks.workbox(gasketAPI);
    assume(results.modifyURLPrefix).to.have.property('.next/', basePath + '_next/');
  });

  it('config modifies urls to use base path with https but no trailing slash', async () => {
    const basePath = 'https://some-cdn.com';
    gasketAPI.config = { basePath };
    const results = await plugin.hooks.workbox(gasketAPI);
    assume(results.modifyURLPrefix).to.have.property('.next/', `${basePath}/_next/`);
  });

  it('config modifies urls to use base path relative path with trailing slash', async () => {
    const basePath = '/some/asset/prefix/';
    gasketAPI.config = { basePath };
    const results = await plugin.hooks.workbox(gasketAPI);
    assume(results.modifyURLPrefix).to.have.property('.next/', `${basePath}_next/`);
  });

  it('config modifies urls to use base path relative path without trailing slash', async () => {
    const basePath = '/some/asset/prefix';
    gasketAPI.config = { basePath };
    const results = await plugin.hooks.workbox(gasketAPI);
    assume(results.modifyURLPrefix).to.have.property('.next/', `${basePath}/_next/`);
  });

  it('config modifies urls to use assetPrefix with https', async () => {
    const assetPrefix = 'https://some-cdn.com/';
    gasketAPI.config = { nextConfig: { assetPrefix } };
    const results = await plugin.hooks.workbox(gasketAPI);
    assume(results.modifyURLPrefix).to.have.property('.next/', assetPrefix + '_next/');
  });

  it('config modifies urls to use assetPrefix with http', async () => {
    const assetPrefix = 'http://some-cdn.com/';
    gasketAPI.config = { nextConfig: { assetPrefix } };
    const results = await plugin.hooks.workbox(gasketAPI);
    assume(results.modifyURLPrefix).to.have.property('.next/', assetPrefix + '_next/');
  });

  it('config modifies urls to use assetPrefix with https but no trailing slash', async () => {
    const assetPrefix = 'https://some-cdn.com';
    gasketAPI.config = { nextConfig: { assetPrefix } };
    const results = await plugin.hooks.workbox(gasketAPI);
    assume(results.modifyURLPrefix).to.have.property('.next/', `${assetPrefix}/_next/`);
  });

  it('config modifies urls to use assetPrefix relative path with trailing slash', async () => {
    const assetPrefix = '/some/asset/prefix/';
    gasketAPI.config = { nextConfig: { assetPrefix } };
    const results = await plugin.hooks.workbox(gasketAPI);
    assume(results.modifyURLPrefix).to.have.property('.next/', `${assetPrefix}_next/`);
  });

  it('config modifies urls to use assetPrefix relative path without trailing slash', async () => {
    const assetPrefix = '/some/asset/prefix';
    gasketAPI.config = { nextConfig: { assetPrefix } };
    const results = await plugin.hooks.workbox(gasketAPI);
    assume(results.modifyURLPrefix).to.have.property('.next/', `${assetPrefix}/_next/`);
  });
});

function mockGasketApi() {
  return {
    command: {
      id: 'fake'
    },
    execWaterfall: stub().returnsArg(1),
    exec: stub().resolves({}),
    execSync: stub().returns([]),
    logger: {
      warning: stub()
    },
    config: {
      webpack: {},  // user specified webpack config
      nextConfig: {},      // user specified next.js config
      root: '/app/path'
    }
  };
}
