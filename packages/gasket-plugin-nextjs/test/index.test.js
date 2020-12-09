/* eslint-disable no-sync */

const { spy, stub } = require('sinon');
const assume = require('assume');
const path = require('path');
const proxyquire = require('proxyquire').noCallThru();
const { devDependencies } = require('../package');

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
  const configureHook = require('../').hooks.configure;

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
});

describe('next hook', () => {
  let next, nextHandler, plugin, expressApp;

  beforeEach(() => {
    expressApp = {
      set: spy(),
      all: spy()
    };
    nextHandler = {
      prepare: stub().resolves(),
      getRequestHandler: stub().resolves({})
    };
    next = stub().returns(nextHandler);

    plugin = proxyquire('../', { next });
  });

  it('executes the `next` lifecycle', async function () {
    const gasket = mockGasketApi();
    await plugin.hooks.express(gasket, expressApp, false);

    assume(gasket.exec).has.been.calledWith('next', nextHandler);
  });

  it('executes the `nextExpress` lifecycle', async function () {
    const gasket = mockGasketApi();
    await plugin.hooks.express(gasket, expressApp, false);

    assume(gasket.exec).has.been.calledWith('nextExpress', { next: nextHandler, express: expressApp });
  });

  it('does not derive a webpack config if not running a dev server', async () => {
    await plugin.hooks.express(mockGasketApi(), expressApp, false);

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
      files: { add: spy() }
    };
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
    const files = { add: spy() };
    await plugin.hooks.create.handler({}, {
      pkg: {
        add: spy(),
        has: stub().callsFake((o, f) => o === 'dependencies' && f === '@gasket/redux')
      },
      files
    });

    assume(files.add).calledWith(
      `${root}/generator/redux/*`,
      `${root}/generator/redux/**/*`
    );
  });

  it('adds appropriate dependencies for redux', async function () {
    const addSpy = spy();
    const files = { add: spy() };
    await plugin.hooks.create.handler({}, {
      pkg: {
        add: addSpy,
        has: stub().callsFake((o, f) => o === 'dependencies' && f === '@gasket/redux')
      },
      files
    });

    assume(addSpy).calledWith('dependencies', {
      'next-redux-wrapper': devDependencies['next-redux-wrapper'],
      'lodash.merge': devDependencies['lodash.merge']
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

  it('supports older next build', async () => {
    const oldBuilderStub = stub();
    const buildHook = getMockedBuildHook({
      'next/dist/server/build': {
        default: oldBuilderStub
      }
    });
    await buildHook({ command: { id: 'build' } });

    assume(oldBuilderStub).called();
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
    gasketAPI.config = { next: { assetPrefix } };
    const results = await plugin.hooks.workbox(gasketAPI);
    assume(results.modifyURLPrefix).to.have.property('.next/', assetPrefix + '_next/');
  });

  it('config modifies urls to use assetPrefix with http', async () => {
    const assetPrefix = 'http://some-cdn.com/';
    gasketAPI.config = { next: { assetPrefix } };
    const results = await plugin.hooks.workbox(gasketAPI);
    assume(results.modifyURLPrefix).to.have.property('.next/', assetPrefix + '_next/');
  });

  it('config modifies urls to use assetPrefix with https but no trailing slash', async () => {
    const assetPrefix = 'https://some-cdn.com';
    gasketAPI.config = { next: { assetPrefix } };
    const results = await plugin.hooks.workbox(gasketAPI);
    assume(results.modifyURLPrefix).to.have.property('.next/', `${assetPrefix}/_next/`);
  });

  it('config modifies urls to use assetPrefix relative path with trailing slash', async () => {
    const assetPrefix = '/some/asset/prefix/';
    gasketAPI.config = { next: { assetPrefix } };
    const results = await plugin.hooks.workbox(gasketAPI);
    assume(results.modifyURLPrefix).to.have.property('.next/', `${assetPrefix}_next/`);
  });

  it('config modifies urls to use assetPrefix relative path without trailing slash', async () => {
    const assetPrefix = '/some/asset/prefix';
    gasketAPI.config = { next: { assetPrefix } };
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
    config: {
      webpack: {},  // user specified webpack config
      next: {},      // user specified next.js config
      root: '/app/path'
    },
    next: {}
  };
}
