const { createLogger, format, transports } = require('winston');
const { name, dependencies } = require('../package.json');

module.exports = {
  name,
  hooks: {
    async create(gasket, { pkg }) {
      pkg.add('dependencies', {
        winston: dependencies.winston
      });
    },
    createLogger(gasket) {
      const { config } = gasket;
      const transportOrTransports = config.winston?.transports;

      let configTransports;
      if (transportOrTransports) {
        if (Array.isArray(transportOrTransports)) {
          configTransports = transportOrTransports;
        } else {
          configTransports = [transportOrTransports];
        }
      } else {
        configTransports = [new transports.Console()];
      }

      // eslint-disable-next-line no-sync
      const pluginTransports = gasket.execSync('winstonTransports');

      return createLogger({
        ...config.winston,
        transports: configTransports.concat(
          pluginTransports.flat().filter(Boolean)
        ),
        format:
          config.winston?.format ??
          format.combine(format.splat(), format.json()),
        exitOnError: true
      });
    },
    metadata(gasket, meta) {
      return {
        ...meta,
        lifecycles: [
          {
            name: 'winstonTransports',
            method: 'execSync',
            description: 'Setup Winston log transports',
            link: 'README.md#winstonTransports',
            parent: 'createLogger'
          }
        ],
        configurations: [
          {
            name: 'winston',
            link: 'README.md#configuration',
            description: 'Setup and customize winston logger',
            type: 'object'
          }
        ]
      };
    }
  }
};
