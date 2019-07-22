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
    start: function start(gasket) {
      const devServer = gasket.command === 'local';

      // Retrieving the server handler
      const handler = gasket.exec('createServers', devServer)[0];

      const { hostname, https, http } = gasket.config;
      const serverOpts = { hostname, handler };

      // create-servers does not support http or https being `null`
      if (http) {
        serverOpts.http = http;
      }
      if (https) {
        serverOpts.https = https;
      }

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
          return;
        }

        await gasket.exec('servers', servers);

        if (http) {
          const port = http.port || http;
          gasket.logger.info(`Server started at http://${hostname}:${port}/`);
        }

        if (https) {
          gasket.logger.info(`Server started at https://${hostname}:${https.port}/`);
        }
      });
    }
  }
};
