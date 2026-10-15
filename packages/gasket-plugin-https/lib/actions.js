import { createTerminus, HealthCheckError } from '@godaddy/terminus';
import debug from 'diagnostics';
import create from 'create-servers';
import one from 'one-time/async.js';
import errs from 'errs';
import { getPortFallback, portInUseError, startProxy, getRawServerConfig } from './utils.js';

const debugLogger = debug('gasket:https');

/**
 * Log the create-servers failure, distinguishing port-in-use from other causes,
 * and return the user-facing message.
 * @type {import('./internal.d.ts').logServerError}
 */
function logServerError(errors, serverOpts, logger) {
  const message = portInUseError(errors)
    ? 'Port is already in use. Please ensure you are not running the same process from another terminal!'
    : `Failed to start the web servers: ${errors.message}`;
  const errorMessage = errs.create({ message, serverOpts });

  debugLogger(errorMessage, errors);
  logger.error(errorMessage.message);
  return errorMessage.message;
}

/**
 * Close servers that started before a startup failure so they are not left
 * listening.
 * @type {import('./internal.d.ts').closeServers}
 */
function closeServers(servers = {}) {
  Object.values(servers)
    .flat()
    .forEach((server) => {
      try {
        server.close();
      } catch (err) {
        debugLogger('Failed to close server after startup error', err);
      }
    });
}

/**
 * Resolve a server config's port into a `:NNNN` URL suffix (empty when unset).
 * The number-vs-object branch exists for `http`, which `ServerOptions` types as
 * `number | false | null | config(s)`. https/http2 are typed as object configs
 * only (never a bare number), so the `typeof === 'number'` test is unreachable
 * for them — the branch is kept so one formatter serves all three protocols.
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
 * Resolves once the servers are listening; rejects if they fail to start.
 * @type {import('@gasket/core').ActionHandler<'startServer'>}
 */
// eslint-disable-next-line max-statements
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

  /**
   * Handle the result of create-servers.
   * @param {any} [errors] Errors from create-servers
   * @param {object} [servers] Servers that were created
   */
  async function created(errors, servers) {
    if (errors) {
      const message = logServerError(errors, serverOpts, logger);
      closeServers(servers);
      // A plain Error, not the errs object: that carries serverOpts, which may include TLS key/cert
      throw new Error(message, { cause: errors });
    }

    // Attach terminus before we call the `servers` lifecycle to ensure that
    // everything is setup before the lifecycle is executed.
    Object.values(servers)
      .reduce((acc, cur) => acc.concat(cur), [])
      .forEach((server) => createTerminus(server, terminusOpts));

    await gasket.exec('servers', servers);
    logServersStarted(serverOpts, logger);
  }

  // create-servers can also reject without calling back, so forward that too
  await new Promise((resolve, reject) => {
    Promise.resolve(create(serverOpts, (errors, servers) => {
      created(errors, servers).then(resolve, reject);
    })).catch(reject);
  });
}

export { startServer };
