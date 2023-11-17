import { hooks as pluginCommand } from '@gasket/plugin-command';
import { hooks as pluginLifecycle } from '@gasket/plugin-lifecycle';
import { hooks as pluginMetadata } from '@gasket/plugin-metadata';
import { hooks as pluginStart } from '@gasket/plugin-start';
import { hooks as pluginGit } from '@gasket/plugin-git';

export const plugins = [
  pluginCommand,
  pluginLifecycle,
  pluginMetadata,
  pluginStart,
  pluginGit
];
