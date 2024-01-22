/* eslint-disable no-sync, max-statements */
const expressApp = {
  set: jest.fn(),
  use: jest.fn(),
  all: jest.fn()
};

const fastifyApp = {
  decorate: jest.fn(),
  register: jest.fn(),
  all: jest.fn()
};

const nextHandler = {
  prepare: jest.fn().mockResolvedValue(),
  getRequestHandler: jest.fn().mockResolvedValue({}),
  buildId: '1234',
  name: 'testapp'
};

const mockSetupNextAppStub = jest.fn(() => nextHandler);

jest.mock('../lib/setup-next-app', () => {
  const mod = jest.requireActual('../lib/setup-next-app');
  return {
    setupNextApp: mockSetupNextAppStub,
    setupNextHandling: mod.setupNextHandling
  };
});

const path = require('path');
const { devDependencies } = require('../package');
const fastify = require('fastify')({
  logger: true
});

describe('Plugin', function () {
  const plugin = require('../lib/');

  it('is an object', () => {
    expect(typeof plugin).toBe('object');
  });

  it('has expected name', () => {
    expect(plugin).toHaveProperty('name', require('../package').name);
  });

  it('has expected hooks', () => {
    const expected = [
      'apmTransaction',
      'build',
      'configure',
      'create',
      'express',
      'fastify',
      'metadata',
      'middleware',
      'prompt',
      'workbox'
    ];

    expect(plugin).toHaveProperty('hooks');

    const hooks = Object.keys(plugin.hooks).sort();
    expect(hooks).toEqual(expected);
    expect(hooks).toHaveLength(expected.length);
  });
});

describe('configure hook', () => {
  const configureHook = require('../lib/').hooks.configure.handler;

  it('adds the sw webpackRegister callback', () => {
    const gasket = mockGasketApi();
    const results = configureHook(gasket, gasket.config);
    expect(results).toHaveProperty('serviceWorker');
    expect(results.serviceWorker).toHaveProperty('webpackRegister');
    expect(typeof results.serviceWorker.webpackRegister).toBe('function');
  });

  it('does not override the sw webpackRegister if exists', () => {
    const gasket = mockGasketApi();
    gasket.config.serviceWorker = { webpackRegister: 'hello' };
    const results = configureHook(gasket, gasket.config);
    expect(typeof results.serviceWorker.webpackRegister).toBe('string');
  });

  it('webpackRegister callback only true for _app entries', () => {
    const gasket = mockGasketApi();
    const results = configureHook(gasket, gasket.config);
    const entryName = results.serviceWorker.webpackRegister;
    expect(entryName('bad')).toEqual(false);
    expect(entryName('_app')).toEqual(true);
    expect(entryName('static/runtime/_app')).toEqual(true);
  });
});

describe('express hook', () => {
  let plugin, hook;

  beforeEach(() => {
    plugin = require('../lib');
    hook = plugin.hooks.express.handler;
  });

  it('timing configured last', async function () {
    const gasket = mockGasketApi();
    await hook(gasket, expressApp, false);

    expect(plugin.hooks.express).toHaveProperty('timing');
    expect(plugin.hooks.express.timing).toEqual({ last: true });
  });

  it('attaches middleware to set NEXT_LOCALE cookie', async function () {
    const gasket = mockGasketApi();
    await hook(gasket, expressApp, false);

    expect(expressApp.use).toHaveBeenCalledWith(expect.any(Function));
    const fn = expressApp.use.mock.calls[0][0];
    expect(fn.name).toEqual('setNextLocale');
  });

  it('middleware sets NEXT_LOCALE cookie from gasketData', async function () {
    const gasket = mockGasketApi();
    await hook(gasket, expressApp, false);

    const fn = expressApp.use.mock.calls[0][0];

    const mockReq = { headers: {} };
    const mockRes = { locals: { gasketData: { intl: { locale: 'fr-FR' } } } };
    const mockNext = jest.fn();
    fn(mockReq, mockRes, mockNext);
    expect(mockReq.headers).toHaveProperty('cookie', ';NEXT_LOCALE=fr-FR');
  });

  it('middleware adds NEXT_LOCALE to existing cookie', async function () {
    const gasket = mockGasketApi();
    await hook(gasket, expressApp, false);

    const fn = expressApp.use.mock.calls[0][0];
    const mockReq = { headers: { cookie: 'bogus=data' } };
    const mockRes = { locals: { gasketData: { intl: { locale: 'fr-FR' } } } };
    const mockNext = jest.fn();
    await fn(mockReq, mockRes, mockNext);

    expect(mockReq.headers).toHaveProperty('cookie', 'bogus=data;NEXT_LOCALE=fr-FR');
  });

  it('middleware does not set NEXT_LOCALE cookie if no gasketData', async function () {
    const gasket = mockGasketApi();
    await hook(gasket, expressApp, false);

    const fn = expressApp.use.mock.calls[0][0];

    const mockReq = { headers: {} };
    const mockRes = { locals: { gasketData: {} } };
    const mockNext = jest.fn();
    fn(mockReq, mockRes, mockNext);
    expect(mockReq.headers).not.toHaveProperty('cookie');
  });

  it('executes the `nextExpress` lifecycle', async function () {
    const gasket = mockGasketApi();
    await hook(gasket, expressApp, false);

    expect(gasket.exec).toHaveBeenCalledWith('nextExpress', {
      next: nextHandler,
      express: expressApp
    });
  });

  it('executes nextPreHandling before next.js handles a request', async () => {
    const gasket = mockGasketApi();
    await hook(gasket, expressApp, false);

    const routeHandler = expressApp.all.mock.calls[expressApp.all.mock.calls.length - 1][1];

    const mockReq = { headers: {} };
    const mockRes = { locals: { gasketData: {} } };
    const mockNext = jest.fn();

    await routeHandler(mockReq, mockRes, mockNext);
    expect(gasket.exec).toHaveBeenCalledWith('nextPreHandling', {
      req: mockReq,
      res: mockRes,
      nextServer: nextHandler
    });
  });

});

describe('fastify hook', () => {
  let plugin, hook;

  beforeEach(() => {
    plugin = require('../lib/');
    hook = plugin.hooks.fastify.handler;
  });

  it('timing configured last', async function () {
    const gasket = mockGasketApi();
    await hook(gasket, fastifyApp, false);

    expect(plugin.hooks.fastify).toHaveProperty('timing');
    expect(plugin.hooks.fastify.timing).toEqual({ last: true });
  });

  it('attaches middleware to set NEXT_LOCALE cookie', async function () {
    const gasket = mockGasketApi();
    await hook(gasket, fastifyApp, false);

    expect(fastifyApp.register).toHaveBeenCalledWith(expect.any(Function));
    const fn = fastifyApp.register.mock.calls[0][0];
    expect(fn.name).toEqual('setNextLocale');
  });

  it('middleware sets NEXT_LOCALE cookie from gasketData', async function () {
    const gasket = mockGasketApi();
    await hook(gasket, fastifyApp, false);

    const fn = fastifyApp.register.mock.calls[0][0];

    const mockReq = { headers: {} };
    const mockRes = { locals: { gasketData: { intl: { locale: 'fr-FR' } } } };
    const mockNext = jest.fn();
    fn(mockReq, mockRes, mockNext);
    expect(mockReq.headers).toHaveProperty('cookie', ';NEXT_LOCALE=fr-FR');
  });

  it('middleware adds NEXT_LOCALE to existing cookie', async function () {
    const gasket = mockGasketApi();
    await hook(gasket, fastifyApp, false);

    const fn = fastifyApp.register.mock.calls[0][0];

    const mockReq = { headers: { cookie: 'bogus=data' } };
    const mockRes = { locals: { gasketData: { intl: { locale: 'fr-FR' } } } };
    const mockNext = jest.fn();
    fn(mockReq, mockRes, mockNext);
    expect(mockReq.headers).toHaveProperty('cookie', 'bogus=data;NEXT_LOCALE=fr-FR');
  });

  it('middleware does not set NEXT_LOCALE cookie if no gasketData', async function () {
    const gasket = mockGasketApi();
    await hook(gasket, fastifyApp, false);

    const fn = fastifyApp.register.mock.calls[0][0];

    const mockReq = { headers: {} };
    const mockRes = { locals: { gasketData: {} } };
    const mockNext = jest.fn();
    fn(mockReq, mockRes, mockNext);
    expect(mockReq.headers).not.toHaveProperty('cookie');
  });

  it('executes the `nextFastify` lifecycle', async function () {
    const gasket = mockGasketApi();
    await hook(gasket, fastifyApp, false);

    expect(gasket.exec).toHaveBeenCalledWith('nextFastify', {
      next: nextHandler,
      fastify: fastifyApp
    });
  });

  it('sets app buildId on fastify app', async function () {
    const gasket = mockGasketApi();
    await hook(gasket, fastify, false);
    expect(fastify['buildId/testapp']).toEqual('1234');
  });

  it('executes nextPreHandling before next.js handles a request', async () => {
    const gasket = mockGasketApi();
    await hook(gasket, fastifyApp, false);

    const routeHandler = fastifyApp.all.mock.calls[fastifyApp.all.mock.calls.length - 1][1];

    const mockReq = { headers: {} };
    const mockRes = { locals: { gasketData: {} } };
    const mockNext = jest.fn();

    await routeHandler(mockReq, mockRes, mockNext);
    expect(gasket.exec).toHaveBeenCalledWith('nextPreHandling', {
      req: mockReq,
      res: mockRes,
      nextServer: nextHandler
    });
  });
});

describe('prompt hook', () => {
  let gasket, context, prompt, mockAnswers;
  const plugin = require('../lib/');
  const promptHook = plugin.hooks.prompt;

  beforeEach(() => {
    gasket = {};
    context = {};
    mockAnswers = { addSitemap: true };
    prompt = jest.fn().mockImplementation(() => mockAnswers);
  });

  it('prompts', async () => {
    await promptHook(gasket, context, { prompt });
    expect(prompt).toHaveBeenCalled();
  });

  it('servers the expected prompt question', async () => {
    await promptHook(gasket, context, { prompt });
    const question = prompt.mock.calls[0][0][0];
    expect(question.name).toEqual('addSitemap');
    expect(question.message).toEqual('Do you want to add a sitemap?');
    expect(question.type).toEqual('confirm');
  });

  it('sets addSitemap to true', async () => {
    const result = await promptHook(gasket, context, { prompt });
    expect(result.addSitemap).toEqual(true);
  });

  it('sets addSitemap to false', async () => {
    mockAnswers = { addSitemap: false };
    const result = await promptHook(gasket, context, { prompt });
    expect(result.addSitemap).toEqual(false);
  });

  it('does not run prompt if addSitemap is in context', async () => {
    context.addSitemap = false;
    const result = await promptHook(gasket, context, { prompt });
    expect(result).toHaveProperty('addSitemap', false);
    expect(prompt).not.toHaveBeenCalled();
  });
});

describe('create hook', () => {
  let mockContext;
  const plugin = require('../lib/');
  const root = path.join(__dirname, '..', 'lib');

  beforeEach(() => {
    mockContext = {
      pkg: {
        add: jest.fn(),
        has: jest.fn()
      },
      files: { add: jest.fn() },
      gasketConfig: {
        add: jest.fn()
      }
    };
  });

  it('has expected timings', async function () {
    expect(plugin.hooks.create.timing.before).toEqual(['@gasket/plugin-intl']);
    expect(plugin.hooks.create.timing.after).toEqual(['@gasket/plugin-redux']);
  });

  it('adds the appropriate globs', async function () {
    await plugin.hooks.create.handler({}, mockContext);

    expect(mockContext.files.add).toHaveBeenCalledWith(
      `${root}/../generator/app/.*`,
      `${root}/../generator/app/*`,
      `${root}/../generator/app/**/*`
    );
  });

  it('adds the appropriate globs for mocha', async function () {
    mockContext.testPlugin = '@gasket/mocha';
    await plugin.hooks.create.handler({}, mockContext);

    expect(mockContext.files.add).toHaveBeenCalledWith(
      `${root}/../generator/mocha/*`,
      `${root}/../generator/mocha/**/*`
    );
  });

  it('adds the appropriate globs for jest', async function () {
    mockContext.testPlugin = '@gasket/jest';
    await plugin.hooks.create.handler({}, mockContext);

    expect(mockContext.files.add).toHaveBeenCalledWith(
      `${root}/../generator/jest/*`,
      `${root}/../generator/jest/**/*`
    );
  });

  it('adds appropriate dependencies', async function () {
    await plugin.hooks.create.handler({}, mockContext);

    expect(mockContext.pkg.add).toHaveBeenCalledWith('dependencies', {
      '@gasket/assets': devDependencies['@gasket/assets'],
      '@gasket/nextjs': devDependencies['@gasket/nextjs'],
      'next': devDependencies.next,
      'prop-types': devDependencies['prop-types'],
      'react': devDependencies.react,
      'react-dom': devDependencies['react-dom']
    });
  });

  it('adds the appropriate globs for redux', async function () {
    mockContext.pkg.has = jest.fn().mockImplementation(
      (o, f) => o === 'dependencies' && f === '@gasket/redux'
    );
    await plugin.hooks.create.handler({}, mockContext);

    expect(mockContext.files.add).toHaveBeenCalledWith(
      `${root}/../generator/redux/*`,
      `${root}/../generator/redux/**/*`
    );
  });

  it('adds appropriate dependencies for redux', async function () {
    mockContext.pkg.has = jest.fn().mockImplementation(
      (o, f) => o === 'dependencies' && f === '@gasket/redux'
    );
    await plugin.hooks.create.handler({}, mockContext);

    expect(mockContext.pkg.add).toHaveBeenCalledWith('dependencies', {
      'next-redux-wrapper': devDependencies['next-redux-wrapper'],
      'lodash.merge': devDependencies['lodash.merge']
    });
  });

  it('adds appropriate dependencies for sitemap', async function () {
    mockContext.addSitemap = true;
    await plugin.hooks.create.handler({}, mockContext);

    expect(mockContext.files.add).toHaveBeenCalledWith(
      `${root}/../generator/sitemap/*`
    );
    expect(mockContext.pkg.add).toHaveBeenCalledWith('dependencies', {
      'next-sitemap': '^3.1.29'
    });
    expect(mockContext.pkg.add).toHaveBeenCalledWith('scripts', {
      sitemap: 'next-sitemap'
    });
  });
});

describe('build hook', () => {
  let mockCreateConfigStub, mockBuilderStub;

  const getMockedBuildHook = () => {
    mockCreateConfigStub = jest.fn();
    mockBuilderStub = jest.fn();

    jest.mock('../lib/config', () => ({
      createConfig: mockCreateConfigStub
    }));

    jest.mock('next/dist/build', () => ({
      default: mockBuilderStub
    }));

    return require('../lib/').hooks.build;
  };

  it('does not build for local command', async () => {
    const buildHook = getMockedBuildHook();
    await buildHook({ command: { id: 'local' } });
    expect(mockBuilderStub).not.toHaveBeenCalled();
  });

  it('uses current next build', async () => {
    const gasket = mockGasketApi();
    const buildHook = getMockedBuildHook();
    await buildHook({ ...gasket, command: { id: 'build' } });
    expect(mockBuilderStub).toHaveBeenCalled();
  });

  it('supports older gasket.command format', async () => {
    const buildHook = getMockedBuildHook();
    await buildHook({ command: 'local' });
    expect(mockBuilderStub).not.toHaveBeenCalled();
  });
});

describe('workbox hook', () => {
  let gasketAPI, plugin;

  beforeEach(() => {
    gasketAPI = mockGasketApi();
    plugin = require('../lib/');
  });

  it('returns workbox config partial', async () => {
    const results = await plugin.hooks.workbox(gasketAPI);

    expect(typeof results).toBe('object');
  });

  it('config partial contains expected properties', async () => {
    const results = await plugin.hooks.workbox(gasketAPI);

    expect(results).toHaveProperty('globDirectory', '.');
    expect(results).toHaveProperty('globPatterns');
    expect(results).toHaveProperty('modifyURLPrefix');
  });

  it('config modifies urls from to _next', async () => {
    const results = await plugin.hooks.workbox(gasketAPI);

    expect(results.modifyURLPrefix).toEqual(expect.objectContaining({
      '.next/': '_next/'
    }));
  });

  it('config modifies urls to use base path with https', async () => {
    const basePath = 'https://some-cdn.com/';
    gasketAPI.config = { basePath };
    const results = await plugin.hooks.workbox(gasketAPI);
    expect(results.modifyURLPrefix).toEqual(expect.objectContaining({
      '.next/': basePath + '_next/'
    }));
  });

  it('config modifies urls to use base path with http', async () => {
    const basePath = 'http://some-cdn.com/';
    gasketAPI.config = { basePath };
    const results = await plugin.hooks.workbox(gasketAPI);
    expect(results.modifyURLPrefix).toEqual(expect.objectContaining({
      '.next/': basePath + '_next/'
    }));
  });

  it('config modifies urls to use base path with https but no trailing slash', async () => {
    const basePath = 'https://some-cdn.com';
    gasketAPI.config = { basePath };
    const results = await plugin.hooks.workbox(gasketAPI);
    expect(results.modifyURLPrefix).toEqual(expect.objectContaining({
      '.next/': `${basePath}/_next/`
    }));
  });

  it('config modifies urls to use base path relative path with trailing slash', async () => {
    const basePath = '/some/asset/prefix/';
    gasketAPI.config = { basePath };
    const results = await plugin.hooks.workbox(gasketAPI);
    expect(results.modifyURLPrefix).toEqual(expect.objectContaining({
      '.next/': `${basePath}_next/`
    }));
  });

  it('config modifies urls to use base path relative path without trailing slash', async () => {
    const basePath = '/some/asset/prefix';
    gasketAPI.config = { basePath };
    const results = await plugin.hooks.workbox(gasketAPI);
    expect(results.modifyURLPrefix).toEqual(expect.objectContaining({
      '.next/': `${basePath}/_next/`
    }));
  });

  it('config modifies urls to use assetPrefix with https', async () => {
    const assetPrefix = 'https://some-cdn.com/';
    gasketAPI.config = { nextConfig: { assetPrefix } };
    const results = await plugin.hooks.workbox(gasketAPI);
    expect(results.modifyURLPrefix).toEqual(expect.objectContaining({
      '.next/': assetPrefix + '_next/'
    }));
  });

  it('config modifies urls to use assetPrefix with http', async () => {
    const assetPrefix = 'http://some-cdn.com/';
    gasketAPI.config = { nextConfig: { assetPrefix } };
    const results = await plugin.hooks.workbox(gasketAPI);
    expect(results.modifyURLPrefix).toEqual(expect.objectContaining({
      '.next/': assetPrefix + '_next/'
    }));
  });

  it('config modifies urls to use assetPrefix with https but no trailing slash', async () => {
    const assetPrefix = 'https://some-cdn.com';
    gasketAPI.config = { nextConfig: { assetPrefix } };
    const results = await plugin.hooks.workbox(gasketAPI);
    expect(results.modifyURLPrefix).toEqual(expect.objectContaining({
      '.next/': `${assetPrefix}/_next/`
    }));
  });

  it('config modifies urls to use assetPrefix relative path with trailing slash', async () => {
    const assetPrefix = '/some/asset/prefix/';
    gasketAPI.config = { nextConfig: { assetPrefix } };
    const results = await plugin.hooks.workbox(gasketAPI);
    expect(results.modifyURLPrefix).toEqual(expect.objectContaining({
      '.next/': `${assetPrefix}_next/`
    }));
  });

  it('config modifies urls to use assetPrefix relative path without trailing slash', async () => {
    const assetPrefix = '/some/asset/prefix';
    gasketAPI.config = { nextConfig: { assetPrefix } };
    const results = await plugin.hooks.workbox(gasketAPI);
    expect(results.modifyURLPrefix).toEqual(expect.objectContaining({
      '.next/': `${assetPrefix}/_next/`
    }));
  });

  it('config modifies urls to use basePath', async () => {
    const assetPrefix = '/from-root';
    gasketAPI.config = { basePath: assetPrefix };
    const results = await plugin.hooks.workbox(gasketAPI);
    expect(results.modifyURLPrefix).toEqual(expect.objectContaining({
      '.next/': `${assetPrefix}/_next/`
    }));
  });
});

function mockGasketApi() {
  return {
    command: {
      id: 'fake'
    },
    execWaterfall: jest.fn((_, arg) => arg),
    exec: jest.fn().mockResolvedValue({}),
    execSync: jest.fn().mockReturnValue([]),
    logger: {
      warning: jest.fn()
    },
    config: {
      webpack: {}, // user specified webpack config
      nextConfig: {}, // user specified next.js config
      root: '/app/path'
    }
  };
}
