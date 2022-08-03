import { Resolver } from './resolver';
import { PluginName, PresetName } from './identifiers';
import * as module from 'module';

/**
 * Module with meta data
 */
export interface ModuleInfo {
  /**
   * - Name of preset
   */
  name: string;
  /**
   * - Actual module content
   */
  module: object;
  /**
   * - Package.json contents
   */
  package?: object;
  /**
   * - Resolved version
   */
  version?: string;
  /**
   * - Path to the root of package
   */
  path?: string;
  /**
   * - Name of module which requires this module
   */
  from?: string;
  /**
   * - Range by which this module was required
   */
  range?: string;
}

/**
 * Plugin module with meta data
 */
export interface PluginInfo extends ModuleInfo {

}

/**
 * Preset module with meta data
 */
export interface PresetInfo extends ModuleInfo {
  plugins: PluginInfo[]
  presets: PresetInfo[]
}

export interface PluginConfig {
  /**
   * Presets to load and add plugins from
   */
  presets?: PresetName[]
  /**
   * Names of plugins to load
   */
  add?: Array<PluginName | object>
  /**
   * Names of plugins to remove (from presets)
   */
  remove?: PluginName[]
}

/**
 * Utility to load plugins, presets, and other modules with associated metadata
 *
 * @type {Loader}
 * @extends Resolver
 */
export class Loader extends Resolver {
  /**
   * @param options - Options
   * @param [options.resolveFrom] - Path(s) to resolve modules from
   * @param [options.require] - Require instance to use
   */
  constructor(options: {
    resolveFrom?: string | string[];
    require?: Function;
  });

  /**
   * Loads a module with additional metadata
   *
   * @param module - Module content
   * @param moduleName - Name of module to load
   * @param [meta] - Additional meta data
   * @returns module
   */
  getModuleInfo(module: object, moduleName: string, meta?: object): ModuleInfo;

  /**
   * Loads a module with additional metadata
   *
   * @param moduleName - Name of module to load
   * @param [meta] - Additional meta data
   * @returns module
   */
  loadModule(moduleName: string, meta?: object): ModuleInfo;

  /**
   * Loads a plugin with additional metadata.
   *
   * @param module - Name of module to load (or module content)
   * @param [meta] - Additional meta data
   * @returns module
   */
  loadPlugin(module: PluginName | object, meta?: object): PluginInfo;

  /**
   * Loads a preset with additional metadata
   *
   * @param module - Name of module to load
   * @param [meta] - Additional meta data
   * @param [options] - Loading options
   * @param [options.shallow] - Do not recursively load dependencies
   * @returns module
   */
  loadPreset(module: PresetName, meta?: object, options?: { shallow: boolean }): PresetInfo;

  /**
   * Loads presets and plugins as configured.
   * Plugins will be filtered and ordered as configuration with priority of:
   *  - added plugins > preset plugins > nested preset plugins
   *
   * @param pluginConfig - Presets and plugins to load
   * @returns results
   */
  loadConfigured(pluginConfig: PluginConfig): {
    presets: PresetInfo[];
    plugins: PluginInfo[];
  };
}
