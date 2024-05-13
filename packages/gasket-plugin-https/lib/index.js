/// <reference types="@gasket/core" />
/// <reference types="@gasket/plugin-start" />
/// <reference types="@gasket/plugin-metadata" />
/// <reference types="@gasket/plugin-logger" />

const { createTerminus, HealthCheckError } = require('@godaddy/terminus');
const debug = require('diagnostics')('gasket:https');
const create = require('create-servers');
const one = require('one-time/async');
const errs = require('errs');
const proxy = require('http-proxy');
const { name, version } = require('../package.json');

/**
 * Provide port defaults
 * @param {string} env env property from gasket config
 * @returns {number} Default port number
 * @public
 */
function getPortFallback(env = '') {
  return /local/.test(env) ? 8080 : 80;
}

/**
 * Check if the supplied errors are a result of the port being in use.
 * @param {Array<object>} errors Errors received from create-servers
 * @returns {boolean} Indication if the port was in use.
 * @private
 */
function portInUseError(errors) {
  const error = Array.isArray(errors) ? errors[0] : errors;
  return ((error.http2 || error.https || error.http || {}).code || '') === 'EADDRINUSE';
}

/**
 * Create a https proxy server for local development
 * @param {import('@gasket/core').DevProxyConfig} opts Gasket instance
 * @param {import('@gasket/plugin-logger').Logger} logger Gasket logger
 */
function startProxy(opts, logger) {
  const { protocol = 'http', hostname = 'localhost', port = 8080, ...proxyOpts } = opts;
  proxy.createServer(
    proxyOpts
  ).on('error', (e) => {
    logger.error('Request failed to proxy:', e);
  }).listen(
    port
  );

  logger.info(`Proxy server started: ${protocol}://${hostname}:${port}`);
}

/**
 * Get server options from the gasket config
 * @param {import('@gasket/core').Gasket} gasket Gasket instance
 * @returns {import('@gasket/core').ServerOptions} config
 */
function getRawServerConfig(gasket) {
  const { hostname, http2, https, http, root } = gasket.config;
  const rawConfig = {};
  rawConfig.hostname = hostname;
  rawConfig.root = root;
  if (http) rawConfig.http = http;
  if (https) rawConfig.https = https;
  if (http2) rawConfig.http2 = http2;
  return rawConfig;
}

/**
 * Gasket action: startServer
 * @param {import('@gasket/core').Gasket} gasket Gasket instance
 * @returns {Promise<void>} promise
 * @public
 */
async function startServer(gasket) {
  const { terminus, env, devProxy } = gasket.config;
  const { logger } = gasket;

  if (devProxy) {
    const opts = await gasket.execWaterfall('devProxy', devProxy);
    return startProxy(Object.assign(devProxy, opts), logger);
  }

  const serverConfig = await gasket.execWaterfall('serverConfig', getRawServerConfig(gasket));
  const serverOpts = await gasket.execWaterfall('createServers', serverConfig);
  const { healthcheck, ...terminusDefaults } = await gasket.execWaterfall(
    'terminus',
    {
      healthcheck: ['/healthcheck', '/healthcheck.html'],
      signals: ['SIGTERM'],
      ...(terminus || {})
    }
  );

  const routes = Array.isArray(healthcheck) ? healthcheck : [healthcheck];

  // Default port to non-essential port on creation
  // create-servers does not support http or https being `null`
  if (!serverOpts.http && !serverOpts.https && !serverOpts.http2) {
    serverOpts.http = getPortFallback(env);
  }

  /**
   * Health check request handler
   */
  async function healthCheckRequested() {
    await gasket.exec('healthcheck', HealthCheckError);
  }

  //
  // It's possible that we are creating multiple servers that are going to hook
  // into terminus. We want to eliminate the possibility of double lifecycle
  // execution so we're going to create a single options object that is going
  // to be used for all terminus based instances.
  //
  // Lifecycles that could potentially be called multiple times are wrapped
  // with a `one-time` function to ensure that the callback is only executed
  // once.
  //
  const terminusOpts = {
    logger: logger.error.bind(logger),
    onSendFailureDuringShutdown: one(
      async function onSendFailureDuringShutdown() {
        await gasket.exec('onSendFailureDuringShutdown');
      }
    ),
    beforeShutdown: one(async function beforeShutdown() {
      await gasket.exec('beforeShutdown');
    }),
    onSignal: one(async function onSignal() {
      await gasket.exec('onSignal');
    }),
    onShutdown: one(async function onShutdown() {
      await gasket.exec('onShutdown');
    }),
    healthChecks: routes.reduce((acc, cur) => {
      acc[cur] = healthCheckRequested;
      return acc;
    }, {}),
    ...terminusDefaults
  };

  // eslint-disable-next-line max-statements
  create(serverOpts, async function created(errors, servers) {
    if (errors) {
      let errorMessage;

      if (portInUseError(errors)) {
        errorMessage = errs.create({
          message:
            'Port is already in use. Please ensure you are not running the same process from another terminal!',
          serverOpts
        });
      } else {
        errorMessage = errs.create({
          message: `Failed to start the web servers: ${errors.message}`,
          serverOpts
        });
      }

      debug(errorMessage, errors);
      logger.error(errorMessage.message);
      return;
    }

    // Attach terminus before we call the `servers` lifecycle to ensure that
    // everything is setup before the lifecycle is executed.
    Object.values(servers)
      .reduce((acc, cur) => acc.concat(cur), [])
      .forEach((server) => createTerminus(server, terminusOpts));

    await gasket.exec('servers', servers);
    const {
      http: _http,
      https: _https,
      http2: _http2,
      hostname: _hostname = 'localhost'
    } = serverOpts;

    if (_http) {
      // @ts-ignore
      const _port = _http.port || _http;
      logger.info(`Server started at http://${_hostname}:${_port}/`);
    }

    if (_https || _http2) {
      logger.info(
        // @ts-ignore
        `Server started at https://${_hostname}:${(_https || _http2).port}/`
      );
    }
  });
}

/** @type {import('@gasket/core').Plugin} */
const plugin = {
  name,
  hooks: {
    actions(gasket) {
      return {
        startServer: async () => await startServer(gasket)
      };
    },
    create: async function createHook(gasket, { pkg, gasketConfig }) {
      gasketConfig.addPlugin('pluginHttps', name);
      pkg.add('dependencies', {
        [name]: `^${version}`
      });
    },
    metadata(gasket, meta) {
      return {
        ...meta,
        lifecycles: [
          {
            name: 'devProxy',
            method: 'execWaterfall',
            description: 'Setup the devProxy options',
            link: 'README.md#devProxy',
            parent: 'start'
          }, {
            name: 'serverConfig',
            method: 'execWaterfall',
            description: 'Setup the server configuration',
            link: 'README.md#serverConfig',
            parent: 'start'
          },
          {
            name: 'createServers',
            method: 'execWaterfall',
            description: 'Setup the `create-servers` options',
            link: 'README.md#createServers',
            parent: 'start'
          },
          {
            name: 'terminus',
            method: 'execWaterfall',
            description: 'Setup the `terminus` options',
            link: 'README.md#terminus',
            parent: 'start',
            after: 'createServers'
          },
          {
            name: 'servers',
            method: 'exec',
            description: 'Access to the server instances',
            link: 'README.md#servers',
            parent: 'start',
            after: 'terminus'
          }
        ],
        configurations: [
          {
            name: 'http',
            link: 'README.md#configuration',
            description: 'HTTP port or config object',
            type: 'number | object'
          },
          {
            name: 'https',
            link: 'README.md#configuration',
            description: 'HTTPS config object',
            type: 'object'
          },
          {
            name: 'http2',
            link: 'README.md#configuration',
            description: 'HTTP2 config object',
            type: 'object'
          },
          {
            name: 'terminus',
            link: 'README.md#configuration',
            description: 'Terminus config object',
            type: 'object'
          },
          {
            name: 'terminus.healthcheck',
            link: 'README.md#configuration',
            description: 'Custom Terminus healthcheck endpoint names',
            default: ['/healthcheck', '/healthcheck.html'],
            type: 'string[]'
          }
        ]
      };
    }
  }
};

module.exports = plugin;
