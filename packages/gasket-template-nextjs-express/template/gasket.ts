import type { GasketConfigDefinition } from '@gasket/core';
import { makeGasket } from '@gasket/core';
import pluginCommand from '@gasket/plugin-command';
import pluginDynamicPlugins from '@gasket/plugin-dynamic-plugins';
import pluginLogger from '@gasket/plugin-logger';
import pluginWebpack from '@gasket/plugin-webpack';
import pluginWinston from '@gasket/plugin-winston';
import pluginHttps from '@gasket/plugin-https';
import pluginExpress from '@gasket/plugin-express';
import pluginNextjs from '@gasket/plugin-nextjs';
import pluginIntl from '@gasket/plugin-intl';

export default makeGasket({
  plugins: [
    pluginCommand,
    pluginDynamicPlugins,
    pluginLogger,
    pluginWebpack,
    pluginWinston,
    pluginHttps,
    pluginExpress,
    pluginNextjs,
    pluginIntl
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
  intl: {
    locales: [
      'en-US',
      'fr-FR'
    ],
    defaultLocale: 'en-US',
    managerFilename: 'intl.ts',
    nextRouting: false
  }
} as GasketConfigDefinition);
