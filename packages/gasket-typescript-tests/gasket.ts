
import type { GasketConfigDefinition } from '@gasket/core';

import pluginAnalyze from '@gasket/plugin-analyze';
import pluginDocs from '@gasket/plugin-docs';
import pluginDocsGraphs from '@gasket/plugin-docs-graphs';
import pluginDocusaurus from '@gasket/plugin-docusaurus';
import pluginElasticApm from '@gasket/plugin-elastic-apm';
import pluginExpress from '@gasket/plugin-express';
import pluginFastify from '@gasket/plugin-fastify';
import pluginHappyFeet from '@gasket/plugin-happyfeet';
import pluginHttps from '@gasket/plugin-https';
import pluginIntl from '@gasket/plugin-intl';
import pluginLogger from '@gasket/plugin-logger';
import pluginMetadata from '@gasket/plugin-metadata';
import pluginMorgan from '@gasket/plugin-morgan';
import pluginNextjs from '@gasket/plugin-nextjs';
import pluginData from '@gasket/plugin-data';
import pluginSwagger from '@gasket/plugin-swagger';
import pluginWebpack from '@gasket/plugin-webpack';
import pluginWinston from '@gasket/plugin-winston';


const config: GasketConfigDefinition = {
  plugins: [
    pluginAnalyze,
    pluginData,
    pluginDocs,
    pluginDocsGraphs,
    pluginDocusaurus,
    pluginElasticApm,
    pluginExpress,
    pluginFastify,
    pluginHappyFeet,
    pluginHttps,
    pluginIntl,
    pluginLogger,
    pluginMetadata,
    pluginMorgan,
    pluginNextjs,
    pluginSwagger,
    pluginWebpack,
    pluginWinston
  ],
  compression: 'garbage',
  http: 8080,
  intl: {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    defaultLocale: 2
  }
};

export default config;
