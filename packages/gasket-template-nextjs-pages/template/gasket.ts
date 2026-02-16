import type { GasketConfigDefinition } from '@gasket/core';
import { makeGasket } from '@gasket/core';
import pluginCommand from '@gasket/plugin-command';
import pluginDynamicPlugins from '@gasket/plugin-dynamic-plugins';
import pluginLogger from '@gasket/plugin-logger';
import pluginWebpack from '@gasket/plugin-webpack';
import pluginWinston from '@gasket/plugin-winston';
import pluginHttpsProxy from '@gasket/plugin-https-proxy';
import pluginNextjs from '@gasket/plugin-nextjs';
import pluginIntl from '@gasket/plugin-intl';

export default makeGasket({
  plugins: [
    pluginCommand,
    pluginDynamicPlugins,
    pluginLogger,
    pluginWebpack,
    pluginWinston,
    pluginHttpsProxy,
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
  httpsProxy: {
    protocol: 'http',
    hostname: 'localhost',
    port: 80,
    xfwd: true,
    ws: true,
    target: {
      host: 'localhost',
      port: 3000
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
