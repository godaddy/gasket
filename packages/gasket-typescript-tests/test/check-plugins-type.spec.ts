/* eslint-disable vitest/expect-expect, jest/expect-expect */
import { Plugin }  from '@gasket/core';
import pluginAnalyze from '@gasket/plugin-analyze';
import pluginCommand from '@gasket/plugin-command';
import pluginData from '@gasket/plugin-data';
import pluginDocs from '@gasket/plugin-docs';
import pluginDocsGraphs from '@gasket/plugin-docs-graphs';
import pluginDocusaurus from '@gasket/plugin-docusaurus';
import pluginDynamicPlugins from '@gasket/plugin-dynamic-plugins';
import pluginExpress from '@gasket/plugin-express';
import pluginFastify from '@gasket/plugin-fastify';
import pluginHttps from '@gasket/plugin-https';
import pluginHttpsProxy from '@gasket/plugin-https-proxy';
import pluginLogger from '@gasket/plugin-logger';
import pluginMetadata from '@gasket/plugin-metadata';
import pluginMiddleware from '@gasket/plugin-middleware';
import pluginMorgan from '@gasket/plugin-morgan';
import pluginNextjs from '@gasket/plugin-nextjs';
import pluginWebpack from '@gasket/plugin-webpack';
import pluginWinston from '@gasket/plugin-winston';
import pluginHappyFeet from '@gasket/plugin-happyfeet';
import pluginIntl from '@gasket/plugin-intl';
import pluginSwagger from '@gasket/plugin-swagger';

// Import ESM plugins
import pluginElasticApm from '@gasket/plugin-elastic-apm';
import pluginManifest from '@gasket/plugin-manifest';
import pluginServiceWorker from '@gasket/plugin-service-worker';
import pluginWorkbox from '@gasket/plugin-workbox';

describe('check plugins type', () => {
  it('should have correct type', () => {
    const plugins: Plugin[] = [
      pluginAnalyze,
      pluginCommand,
      pluginData,
      pluginDocs,
      pluginDocsGraphs,
      pluginDocusaurus,
      pluginDynamicPlugins,
      pluginElasticApm,
      pluginExpress,
      pluginFastify,
      pluginHappyFeet,
      pluginHttps,
      pluginHttpsProxy,
      pluginIntl,
      pluginLogger,
      pluginManifest,
      pluginMetadata,
      pluginMiddleware,
      pluginMorgan,
      pluginNextjs,
      pluginServiceWorker,
      pluginSwagger,
      pluginWebpack,
      pluginWinston,
      pluginWorkbox
    ];
  });
});
