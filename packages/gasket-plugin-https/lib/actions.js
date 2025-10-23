import { createTerminus, HealthCheckError } from '@godaddy/terminus';
import debug from 'diagnostics';
import create from 'create-servers';
// @ts-expect-error - one-time/async does not have type definitions
import one from 'one-time/async';
import errs from 'errs';
import { getPortFallback, portInUseError, startProxy, getRawServerConfig } from './utils.js';

const debugLogger = debug('gasket:https');

/**
 * Gasket action: startServer
 * @param {import('@gasket/core').Gasket} gasket Gasket instance
 * @returns {Promise<void>} promise
 * @public
 */
async function startServer(gasket) {
  await gasket.isReady;
  await gasket.exec('preboot');

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
    await gasket.traceRoot().exec('healthcheck', HealthCheckError);
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

      debugLogger(errorMessage, errors);
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
      let _port = (typeof _http === 'number' ? _http : _http.port) ?? '';
      if (_port) _port = `:${_port}`;

      logger.info(`Server started at http://${_hostname}${_port}/`);
    }

    if (_https || _http2) {
      let _port = (_https ?? _http2).port ?? '';
      if (_port) _port = `:${_port}`;

      logger.info(
        `Server started at https://${_hostname}${_port}/`
      );
    }
  });
}

export { startServer };
