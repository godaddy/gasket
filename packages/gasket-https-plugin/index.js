const debug = require('diagnostics')('gasket:https');
const create = require('create-servers');
const errs = require('errs');

function portInUseError(errors) {
  if (Array.isArray(errors)) {
    errors = errors[0];
  }
  return (errors.https || errors.http || {}).errno === 'EADDRINUSE';
}

module.exports = {
  name: 'https',
  hooks: {
    start: async function start(gasket) {
      const { logger } = gasket;
      const { hostname, https, http } = gasket.config;

      // Retrieving server opts
      const configOpts = { hostname };

      // create-servers does not support http or https being `null`
      if (http) {
        configOpts.http = http;
      }
      if (https) {
        configOpts.https = https;
      }
      if (!http && !https) {
        configOpts.http = 80;
      }

      const serverOpts = await gasket.execWaterfall('createServers', configOpts);

      create(serverOpts, async function created(errors, servers) {
        if (errors) {
          let errorMessage;
          if (portInUseError(errors)) {
            errorMessage = errs.create({
              message: 'Port is already in use. Please ensure you are not running the same process from another terminal!',
              serverOpts
            });
          } else {
            errorMessage = errs.create({
              message: 'failed to start the http/https servers',
              serverOpts
            });
          }
          debug(errorMessage, errors);
          logger.error(errorMessage.message);
          return;
        }

        await gasket.exec('servers', servers);

        const { http: _http, https: _https, hostname: _hostname = 'localhost' } = serverOpts;

        if (_http) {
          const _port = _http.port || _http;
          logger.info(`Server started at http://${_hostname}:${_port}/`);
        }

        if (_https) {
          logger.info(`Server started at https://${_hostname}:${_https.port}/`);
        }
      });
    }
  }
};
