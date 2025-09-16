import type { GasketConfigDefinition } from '@gasket/core';
import { makeGasket } from '@gasket/core';
import pluginCommand from '@gasket/plugin-command';
import pluginDynamicPlugins from '@gasket/plugin-dynamic-plugins';
import pluginHttps from '@gasket/plugin-https';
import pluginLogger from '@gasket/plugin-logger';
import pluginWinston from '@gasket/plugin-winston';
import pluginFastify from '@gasket/plugin-fastify';
import pluginRoutes from './plugins/routes-plugin.js';
import pluginSwagger from '@gasket/plugin-swagger';

export default makeGasket({
  plugins: [
    pluginCommand,
    pluginDynamicPlugins,
    pluginHttps,
    pluginLogger,
    pluginWinston,
    pluginFastify,
    pluginRoutes,
    pluginSwagger
  ],
  commands: {
    docs: {
      dynamicPlugins: [
        '@gasket/plugin-docs',
        '@gasket/plugin-metadata',
        '@gasket/plugin-docusaurus'
      ]
    }
  },
  swagger: {
    jsdoc: {
      definition: {
        info: {
          title: 'fastify-ts',
          version: '0.0.0'
        }
      },
      apis: [
        './routes/*',
        './plugins/*'
      ]
    }
  }
} as GasketConfigDefinition);
