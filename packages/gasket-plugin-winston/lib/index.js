/// <reference types="@gasket/plugin-logger" />
/// <reference types="create-gasket-app" />
/// <reference types="@gasket/plugin-metadata" />

const { createLogger, format, transports, config: winstonConfig } = require('winston');
const {
  name,
  version,
  description,
  dependencies
} = require('../package.json');

/** @type {import('@gasket/core').Plugin} */
const plugin = {
  name,
  version,
  description,
  hooks: {
    create(gasket, { pkg, gasketConfig }) {
      gasketConfig.addPlugin('pluginWinston', '@gasket/plugin-winston');
      pkg.add('dependencies', {
        [name]: `^${version}`,
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

      const pluginTransports = gasket.execSync('winstonTransports');
      const defaultFormat = gasket.config.env.startsWith('local') ?
        format.simple() :
        format.combine(format.splat(), format.json());

      return createLogger({
        format: defaultFormat,
        levels: Object.assign({ fatal: 0, warn: 4, trace: 7 }, winstonConfig.syslog.levels),
        exitOnError: true,
        ...config.winston,
        transports: configTransports.concat(
          pluginTransports.flat().filter(Boolean)
        )
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

module.exports = plugin;
