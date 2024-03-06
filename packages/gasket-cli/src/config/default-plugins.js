import pluginLifecyle from '@gasket/plugin-lifecycle';
import pluginMetadata from '@gasket/plugin-metadata';
import pluginStart from '@gasket/plugin-start';
import pluginGit from '@gasket/plugin-git';

export const defaultPlugins = [
  pluginLifecyle,
  pluginMetadata,
  pluginStart,
  pluginGit
];
