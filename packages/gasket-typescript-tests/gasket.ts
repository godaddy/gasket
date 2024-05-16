/* eslint-disable spaced-comment */
import type { GasketConfigDefinition } from '@gasket/core';

import pluginAnalyze from '@gasket/plugin-analyze';
import pluginCypress from '@gasket/plugin-cypress';
import pluginDocs from '@gasket/plugin-docs';
import pluginDocsGraphs from '@gasket/plugin-docs-graphs';
import pluginDocusaurus from '@gasket/plugin-docusaurus';
import pluginElasticApm from '@gasket/plugin-elastic-apm';
import pluginExpress from '@gasket/plugin-express';
import pluginFastify from '@gasket/plugin-fastify';
import pluginGit from '@gasket/plugin-git';
import pluginHappyFeet from '@gasket/plugin-happyfeet';
import pluginHttps from '@gasket/plugin-https';
import pluginIntl from '@gasket/plugin-intl';
import pluginJest from '@gasket/plugin-jest';
import pluginLint from '@gasket/plugin-lint';
import pluginLogger from '@gasket/plugin-logger';
import pluginManifest from '@gasket/plugin-manifest';
import pluginMetadata from '@gasket/plugin-metadata';
import pluginMetrics from '@gasket/plugin-metrics';
import pluginMocha from '@gasket/plugin-mocha';
import pluginMorgan from '@gasket/plugin-morgan';
import pluginNextjs from '@gasket/plugin-nextjs';
import pluginRedux from '@gasket/plugin-redux';
import pluginResponseData from '@gasket/plugin-response-data';
import pluginServiceWorker from '@gasket/plugin-service-worker';
import pluginStart from '@gasket/plugin-start';
import pluginSwagger from '@gasket/plugin-swagger';
import pluginTypescript from '@gasket/plugin-typescript';
import pluginWebpack from '@gasket/plugin-webpack';
import pluginWinston from '@gasket/plugin-winston';
import pluginWorkbox from '@gasket/plugin-workbox';


const config: GasketConfigDefinition = {
  plugins: [
    pluginAnalyze,
    pluginCypress,
    pluginDocs,
    pluginDocsGraphs,
    pluginDocusaurus,
    pluginElasticApm,
    pluginExpress,
    pluginFastify,
    pluginGit,
    pluginHappyFeet,
    pluginHttps,
    pluginIntl,
    pluginJest,
    pluginLint,
    pluginLogger,
    pluginManifest,
    pluginMetadata,
    pluginMetrics,
    pluginMocha,
    pluginMorgan,
    pluginNextjs,
    pluginRedux,
    pluginResponseData,
    pluginServiceWorker,
    pluginStart,
    pluginSwagger,
    pluginTypescript,
    pluginWebpack,
    pluginWinston,
    pluginWorkbox
  ],
  compression: 'garbage',
  http: 8080,
  intl: {
    // @ts-expect-error
    defaultLocale: 2
  }
};

export default config;
