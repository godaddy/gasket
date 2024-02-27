import { plugin as pluginCommand } from '@gasket/plugin-command';
import pluginLifecycle from '@gasket/plugin-lifecycle';
import pluginMetadata from '@gasket/plugin-metadata';
import pluginStart from '@gasket/plugin-start';
import pluginGit from '@gasket/plugin-git';

export const plugins = [
  pluginCommand,
  pluginLifecycle,
  pluginMetadata,
  pluginStart,
  pluginGit
];
