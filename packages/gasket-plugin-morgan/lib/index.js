const morgan = require('morgan');
const split = require('split');
const { name } = require('../package');

// set log configuration in gasket.config.js, under `morgan` key
// configuration options: http://expressjs.com/en/resources/middleware/morgan.html
module.exports = {
  name,
  dependencies: ['@gasket/plugin-log'],
  hooks: {
    middleware: {
      handler: (gasket) => {
        const { logger, config } = gasket;
        const { morgan: { format = 'tiny', options = {} } = {} } = config;

        const stream = split().on('data', (line) => logger.info(line));

        const morganMiddleware = morgan(format, { ...options, stream });

        return [morganMiddleware];
      }
    },
    metadata(gasket, meta) {
      return {
        ...meta,
        configurations: [{
          name: 'morgan',
          link: 'README.md#configuration',
          description: 'Morgan plugin configuration file.',
          type: 'object',
          default: '{}'
        }, {
          name: 'morgan.format',
          link: 'README.md#configuration',
          description: 'Log format to print.',
          type: 'string',
          default: 'tiny'
        }, {
          name: 'morgan.options',
          link: 'README.md#configuration',
          description: 'Morgan options.',
          type: 'object'
        }]
      };
    }
  }
};
