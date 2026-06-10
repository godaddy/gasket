import { createTerminus, HealthCheckError } from '@godaddy/terminus';
import debug from 'diagnostics';
import create from 'create-servers';
import one from 'one-time/async.js';
import errs from 'errs';
import { getPortFallback, portInUseError, startProxy, getRawServerConfig } from './utils.js';

const debugLogger = debug('gasket:https');

/**
 * Log the create-servers failure, distinguishing port-in-use from other causes.
 * @type {import('./internal.d.ts').logServerError}
 */
function logServerError(errors, serverOpts, logger) {
  const message = portInUseError(errors)
    ? 'Port is already in use. Please ensure you are not running the same process from another terminal!'
    : `Failed to start the web servers: ${errors.message}`;
  const errorMessage = errs.create({ message, serverOpts });

  debugLogger(errorMessage, errors);
  logger.error(errorMessage.message);
}

/**
 * Resolve a server config's port into a `:NNNN` URL suffix (empty when unset).
 * The number-vs-object branch exists for `http`, which may be a bare port
 * number or a config object. https/http2 are always objects per ServerOptions,
 * so the number branch is a harmless no-op for them — keep it so this stays a
 * single shared formatter for all three.
 * @type {import('./internal.d.ts').portSuffix}
 */
function portSuffix(server) {
  // Arrays (multiple configs) and falsy values carry no single port to format.
  const single = server && !Array.isArray(server) ? server : null;
  const port = (typeof single === 'number' ? single : single?.port) ?? '';
  return port ? `:${port}` : '';
}

/**
 * Log the started-server URLs, one line per protocol that was created.
 * http and https/http2 are reported separately because they map to different
 * URL schemes; https and http2 share the `https://` scheme.
 * @type {import('./internal.d.ts').logServersStarted}
 */
function logServersStarted(serverOpts, logger) {
  const { http: _http, https: _https, http2: _http2, hostname = 'localhost' } = serverOpts;

  if (_http) {
    logger.info(`Server started at http://${hostname}${portSuffix(_http)}/`);
  }

  if (_https || _http2) {
    logger.info(`Server started at https://${hostname}${portSuffix(_https ?? _http2)}/`);
  }
}

/**
 * Build the shared terminus options object used for every created server.
 *
 * It's possible that we are creating multiple servers that are going to hook
 * into terminus. We want to eliminate the possibility of double lifecycle
 * execution so we create a single options object used for all terminus-based
 * instances. Lifecycles that could potentially be called multiple times are
 * wrapped with a `one-time` function to ensure the callback only executes once.
 * @type {import('./internal.d.ts').buildTerminusOptions}
 */
function buildTerminusOptions(gasket, logger, routes, terminusDefaults) {
  /**
   * Health check request handler
   */
  async function healthCheckRequested() {
    await gasket.traceRoot().exec('healthcheck', HealthCheckError);
  }

  return {
    logger: logger.error.bind(logger),
    onSendFailureDuringShutdown: one(async function onSendFailureDuringShutdown() {
      await gasket.exec('onSendFailureDuringShutdown');
    }),
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
}

/**
 * Gasket action: startServer
 * @type {import('./internal.d.ts').startServer}
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

  const terminusOpts = buildTerminusOptions(gasket, logger, routes, terminusDefaults);

  create(serverOpts, async function created(errors, servers) {
    if (errors) {
      logServerError(errors, serverOpts, logger);
      return;
    }

    // Attach terminus before we call the `servers` lifecycle to ensure that
    // everything is setup before the lifecycle is executed.
    Object.values(servers)
      .reduce((acc, cur) => acc.concat(cur), [])
      .forEach((server) => createTerminus(server, terminusOpts));

    await gasket.exec('servers', servers);
    logServersStarted(serverOpts, logger);
  });
}

export { startServer };
