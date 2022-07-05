const build = require('./build');
const configure = require('./configure');
const serve = require('./serve');
const middleware = require('./middleware');

module.exports = {
  name: require('../package').name,
  hooks: {
    build,
    configure,
    express: serve,
    fastify: serve,
    middleware,
    metadata(gasket, meta) {
      return {
        ...meta,
        lifecycles: [
          {
            name: 'manifest',
            method: 'execWaterfall',
            description: 'Modify the the web manifest for a request',
            link: 'README.md#manifest',
            parent: 'middleware'
          }
        ]
      };
    }
  }
};
