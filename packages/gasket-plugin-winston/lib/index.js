/// <reference types="@gasket/plugin-logger" />
/// <reference types="create-gasket-app" />
/// <reference types="@gasket/plugin-metadata" />

import { createLogger, format, transports, config as winstonConfig } from 'winston';
import packageJson from '../package.json' with { type: 'json' };
const {
  name,
  version,
  description,
  dependencies
} = packageJson;

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

      const baseLevels = config.winston?.levels ??
        Object.assign({ fatal: 0, warn: 4, trace: 7 }, winstonConfig.syslog.levels);
      const pluginLevels = gasket.execSync('winstonLevels').filter(Boolean);
      const levels = pluginLevels.length ? Object.assign({}, baseLevels, ...pluginLevels) : baseLevels;

      const baseFormat = config.winston?.format ?? (gasket.config.env.startsWith('local') ?
        format.simple() :
        format.combine(format.splat(), format.json()));
      // Contributed formats run first so they enrich the entry before the base format serializes it
      const pluginFormats = gasket.execSync('winstonFormats').filter(Boolean);
      const resolvedFormat = pluginFormats.length ? format.combine(...pluginFormats, baseFormat) : baseFormat;

      return createLogger({
        exitOnError: true,
        ...config.winston,
        levels,
        format: resolvedFormat,
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
          },
          {
            name: 'winstonLevels',
            method: 'execSync',
            description: 'Add Winston log levels',
            link: 'README.md#winstonLevels',
            parent: 'createLogger'
          },
          {
            name: 'winstonFormats',
            method: 'execSync',
            description: 'Add Winston log formats',
            link: 'README.md#winstonFormats',
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

export default plugin;
