/** @type {import('@gasket/core').HookHandler<'metadata'>} */
module.exports = function metadata(gasket, meta) {
  return {
    ...meta,
    actions: [
      {
        name: 'startServer',
        description: 'Start the server',
        link: 'README.md#startServer'
      }
    ],
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
};
