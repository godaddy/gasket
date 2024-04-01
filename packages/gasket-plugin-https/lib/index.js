/// <reference types="@gasket/plugin-start" />
/// <reference types="@gasket/plugin-metadata" />
/// <reference types="@gasket/plugin-log" />

const { createTerminus, HealthCheckError } = require('@godaddy/terminus');
const debug = require('diagnostics')('gasket:https');
const create = require('create-servers');
const one = require('one-time/async');
const errs = require('errs');

const { name } = require('../package.json');

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
 * Start lifecycle of a gasket application
 * @param {import("@gasket/engine").Gasket} gasket Gasket instance
 * @public
 */
async function start(gasket) {
  const { hostname, http2, https, http, terminus, env } = gasket.config;
  const { logger } = gasket;

  // Retrieving server opts
  const configOpts = { hostname };

  if (http) configOpts.http = http;
  if (https) configOpts.https = https;
  if (http2) configOpts.http2 = http2;

  const serverOpts = await gasket.execWaterfall('createServers', configOpts);
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

/** @type {import('@gasket/engine').Plugin} */
const plugin = {
  name,
  hooks: {
    start,
    metadata(gasket, meta) {
      return {
        ...meta,
        lifecycles: [
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
