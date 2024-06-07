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

const nextServer = {
  prepare: jest.fn().mockResolvedValue(),
  getRequestHandler: jest.fn().mockResolvedValue({}),
  buildId: '1234',
  name: 'testapp'
};

const mockSetupNextAppStub = jest.fn(() => nextServer);

jest.mock('../lib/utils/setup-next-app', () => {
  const mod = jest.requireActual('../lib/utils/setup-next-app');
  return {
    setupNextApp: mockSetupNextAppStub,
    setupNextHandling: mod.setupNextHandling
  };
});

const fastify = require('fastify')({
  logger: true
});
const { name, version, description } = require('../package');

describe('Plugin', function () {
  const plugin = require('../lib/');

  it('is an object', () => {
    expect(typeof plugin).toBe('object');
  });

  it('has expected properties', () => {
    expect(plugin).toHaveProperty('name', name);
    expect(plugin).toHaveProperty('version', version);
    expect(plugin).toHaveProperty('description', description);
  });

  it('has expected hooks', () => {
    const expected = [
      'actions',
      'apmTransaction',
      'configure',
      'create',
      'express',
      'fastify',
      'metadata',
      'middleware',
      'prompt',
      'webpackConfig',
      'workbox'
    ];

    expect(plugin).toHaveProperty('hooks');

    const hooks = Object.keys(plugin.hooks).sort();
    expect(hooks).toEqual(expected);
    expect(hooks).toHaveLength(expected.length);
  });
});

describe('configure hook', () => {
  const configureHook = require('../lib/').hooks.configure;

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

    expect(mockReq.headers).toHaveProperty(
      'cookie',
      'bogus=data;NEXT_LOCALE=fr-FR'
    );
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
      next: nextServer,
      express: expressApp
    });
  });

  it('executes nextPreHandling before next.js handles a request', async () => {
    const gasket = mockGasketApi();
    await hook(gasket, expressApp, false);

    const routeHandler =
      expressApp.all.mock.calls[expressApp.all.mock.calls.length - 1][1];

    const mockReq = { headers: {} };
    const mockRes = { locals: { gasketData: {} } };
    const mockNext = jest.fn();

    await routeHandler(mockReq, mockRes, mockNext);
    expect(gasket.exec).toHaveBeenCalledWith('nextPreHandling', {
      req: mockReq,
      res: mockRes,
      nextServer
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
    expect(mockReq.headers).toHaveProperty(
      'cookie',
      'bogus=data;NEXT_LOCALE=fr-FR'
    );
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
      next: nextServer,
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

    const routeHandler =
      fastifyApp.all.mock.calls[fastifyApp.all.mock.calls.length - 1][1];

    const mockReq = { headers: {} };
    const mockRes = { locals: { gasketData: {} } };
    const mockNext = jest.fn();

    await routeHandler(mockReq, mockRes, mockNext);
    expect(gasket.exec).toHaveBeenCalledWith('nextPreHandling', {
      req: mockReq,
      res: mockRes,
      nextServer
    });
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

    expect(results.modifyURLPrefix).toEqual(
      expect.objectContaining({
        '.next/': '_next/'
      })
    );
  });

  it('config modifies urls to use base path with https', async () => {
    const basePath = 'https://some-cdn.com/';
    gasketAPI.config = { basePath };
    const results = await plugin.hooks.workbox(gasketAPI);
    expect(results.modifyURLPrefix).toEqual(
      expect.objectContaining({
        '.next/': basePath + '_next/'
      })
    );
  });

  it('config modifies urls to use base path with http', async () => {
    const basePath = 'http://some-cdn.com/';
    gasketAPI.config = { basePath };
    const results = await plugin.hooks.workbox(gasketAPI);
    expect(results.modifyURLPrefix).toEqual(
      expect.objectContaining({
        '.next/': basePath + '_next/'
      })
    );
  });

  it('config modifies urls to use base path with https but no trailing slash', async () => {
    const basePath = 'https://some-cdn.com';
    gasketAPI.config = { basePath };
    const results = await plugin.hooks.workbox(gasketAPI);
    expect(results.modifyURLPrefix).toEqual(
      expect.objectContaining({
        '.next/': `${basePath}/_next/`
      })
    );
  });

  it('config modifies urls to use base path relative path with trailing slash', async () => {
    const basePath = '/some/asset/prefix/';
    gasketAPI.config = { basePath };
    const results = await plugin.hooks.workbox(gasketAPI);
    expect(results.modifyURLPrefix).toEqual(
      expect.objectContaining({
        '.next/': `${basePath}_next/`
      })
    );
  });

  it('config modifies urls to use base path relative path without trailing slash', async () => {
    const basePath = '/some/asset/prefix';
    gasketAPI.config = { basePath };
    const results = await plugin.hooks.workbox(gasketAPI);
    expect(results.modifyURLPrefix).toEqual(
      expect.objectContaining({
        '.next/': `${basePath}/_next/`
      })
    );
  });

  it('config modifies urls to use assetPrefix with https', async () => {
    const assetPrefix = 'https://some-cdn.com/';
    gasketAPI.config = { nextConfig: { assetPrefix } };
    const results = await plugin.hooks.workbox(gasketAPI);
    expect(results.modifyURLPrefix).toEqual(
      expect.objectContaining({
        '.next/': assetPrefix + '_next/'
      })
    );
  });

  it('config modifies urls to use assetPrefix with http', async () => {
    const assetPrefix = 'http://some-cdn.com/';
    gasketAPI.config = { nextConfig: { assetPrefix } };
    const results = await plugin.hooks.workbox(gasketAPI);
    expect(results.modifyURLPrefix).toEqual(
      expect.objectContaining({
        '.next/': assetPrefix + '_next/'
      })
    );
  });

  it('config modifies urls to use assetPrefix with https but no trailing slash', async () => {
    const assetPrefix = 'https://some-cdn.com';
    gasketAPI.config = { nextConfig: { assetPrefix } };
    const results = await plugin.hooks.workbox(gasketAPI);
    expect(results.modifyURLPrefix).toEqual(
      expect.objectContaining({
        '.next/': `${assetPrefix}/_next/`
      })
    );
  });

  it('config modifies urls to use assetPrefix relative path with trailing slash', async () => {
    const assetPrefix = '/some/asset/prefix/';
    gasketAPI.config = { nextConfig: { assetPrefix } };
    const results = await plugin.hooks.workbox(gasketAPI);
    expect(results.modifyURLPrefix).toEqual(
      expect.objectContaining({
        '.next/': `${assetPrefix}_next/`
      })
    );
  });

  it('config modifies urls to use assetPrefix relative path without trailing slash', async () => {
    const assetPrefix = '/some/asset/prefix';
    gasketAPI.config = { nextConfig: { assetPrefix } };
    const results = await plugin.hooks.workbox(gasketAPI);
    expect(results.modifyURLPrefix).toEqual(
      expect.objectContaining({
        '.next/': `${assetPrefix}/_next/`
      })
    );
  });

  it('config modifies urls to use basePath', async () => {
    const assetPrefix = '/from-root';
    gasketAPI.config = { basePath: assetPrefix };
    const results = await plugin.hooks.workbox(gasketAPI);
    expect(results.modifyURLPrefix).toEqual(
      expect.objectContaining({
        '.next/': `${assetPrefix}/_next/`
      })
    );
  });
});


/**
 * Mock Gasket API
 * @returns {object} gasketAPI
 */
function mockGasketApi() {
  return {
    command: {
      id: 'fake'
    },
    execWaterfallSync: jest.fn((_, arg) => arg),
    exec: jest.fn().mockResolvedValue({}),
    execSync: jest.fn().mockReturnValue([]),
    logger: {
      warn: jest.fn()
    },
    config: {
      webpack: {}, // user specified webpack config
      nextConfig: {}, // user specified next.js config
      root: '/app/path'
    }
  };
}
