import pluginMetadata from '@gasket/plugin-metadata';
import pluginGit from '@gasket/plugin-git';
import pluginLogger from '@gasket/plugin-logger';

export const defaultPlugins = [
  pluginLogger,
  pluginMetadata,
  pluginGit
];
