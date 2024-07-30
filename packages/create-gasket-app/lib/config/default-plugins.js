import pluginGit from '@gasket/plugin-git';
import pluginLogger from '@gasket/plugin-logger';
import pluginMetadata from '@gasket/plugin-metadata';
import pluginCommand from '@gasket/plugin-command';
import pluginDocs from '@gasket/plugin-docs';
import pluginDocusaurus from '@gasket/plugin-docusaurus';

export const defaultPlugins = [
  pluginLogger,
  pluginGit,
  pluginMetadata,
  pluginCommand,
  pluginDocs,
  pluginDocusaurus
];
