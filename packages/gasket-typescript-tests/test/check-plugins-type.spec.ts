import { Plugin }  from '@gasket/core'
import pluginAnalyze from '@gasket/plugin-analyze'
import pluginCommand from '@gasket/plugin-command';
import pluginCypress from '@gasket/plugin-cypress';
import pluginData from '@gasket/plugin-data';
import pluginDocs from '@gasket/plugin-docs';
import pluginDocsGraphs from '@gasket/plugin-docs-graphs';
import pluginDocusaurus from '@gasket/plugin-docusaurus';
import pluginDynamicPlugins from '@gasket/plugin-dynamic-plugins';
import pluginElasticApm from '@gasket/plugin-elastic-apm';
import pluginExpress from '@gasket/plugin-express';
import pluginFastify from '@gasket/plugin-fastify';
import pluginGit from '@gasket/plugin-git';
import pluginHappyFeet from '@gasket/plugin-happyfeet';
import pluginHttps from '@gasket/plugin-https';
import pluginHttpsProxy from '@gasket/plugin-https-proxy';
import pluginIntl from '@gasket/plugin-intl';
import pluginJest from '@gasket/plugin-jest';
import pluginLint from '@gasket/plugin-lint';
import pluginLogger from '@gasket/plugin-logger';
import pluginManifest from '@gasket/plugin-manifest';
import pluginMetadata from '@gasket/plugin-metadata';
import pluginMiddleware from '@gasket/plugin-middleware';
import pluginMocha from '@gasket/plugin-mocha';
import pluginMorgan from '@gasket/plugin-morgan';
import pluginNextjs from '@gasket/plugin-nextjs';
import pluginRedux from '@gasket/plugin-redux';
import pluginServiceWorker from '@gasket/plugin-service-worker';
import pluginSwagger from '@gasket/plugin-swagger';
import pluginTypeScript from '@gasket/plugin-typescript';
import pluginWebpack from '@gasket/plugin-webpack';
import pluginWinston from '@gasket/plugin-winston';
import pluginWorkbox from '@gasket/plugin-workbox';

const plugins: Plugin[] = [
  pluginAnalyze,
  pluginCommand,
  pluginCypress,
  pluginData,
  pluginDocs,
  pluginDocsGraphs,
  pluginDocusaurus,
  pluginDynamicPlugins,
  pluginElasticApm,
  pluginExpress,
  pluginFastify,
  pluginGit,
  pluginHappyFeet,
  pluginHttps,
  pluginHttpsProxy,
  pluginIntl,
  pluginJest,
  pluginLint,
  pluginLogger,
  pluginManifest,
  pluginMetadata,
  pluginMiddleware,
  pluginMocha,
  pluginMorgan,
  pluginNextjs,
  pluginRedux,
  pluginServiceWorker,
  pluginSwagger,
  pluginTypeScript,
  pluginWebpack,
  pluginWinston,
  pluginWorkbox
];
