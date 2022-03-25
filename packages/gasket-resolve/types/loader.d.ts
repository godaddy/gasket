import Resolver from './resolver';
import {PluginName, PresetName} from "./identifiers";

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

/**
 * Utility to load plugins, presets, and other modules with associated metadata
 *
 * @type {Loader}
 * @extends Resolver
 */
export class Loader extends Resolver {
    /**
     * @param {object} options - Options
     * @param {string|string[]} [options.resolveFrom] - Path(s) to resolve modules from
     * @param {require} [options.require] - Require instance to use
     */
    constructor(options: {
        resolveFrom?: string | string[];
        require?: Function;
    });
    /**
     * Loads a module with additional metadata
     *
     * @param {object} module - Module content
     * @param {string} moduleName - Name of module to load
     * @param {object} [meta] - Additional meta data
     * @returns {ModuleInfo} module
     */
    getModuleInfo(module: object, moduleName: string, meta?: object): ModuleInfo;
    /**
     * Loads a module with additional metadata
     *
     * @param {string} moduleName - Name of module to load
     * @param {object} [meta] - Additional meta data
     * @returns {ModuleInfo} module
     */
    loadModule(moduleName: string, meta?: object): ModuleInfo;
    /**
     * Loads a plugin with additional metadata.
     *
     * @param {PluginName|object} module - Name of module to load (or module content)
     * @param {object} [meta] - Additional meta data
     * @returns {PluginInfo} module
     */
    loadPlugin(module: PluginName | object, meta?: object): PluginInfo;
    /**
     * Loads a preset with additional metadata
     *
     * @param {PresetName} module - Name of module to load
     * @param {object} [meta] - Additional meta data
     * @param {boolean} [options] - Loading options
     * @param {boolean} [options.shallow] - Do not recursively load dependencies
     * @returns {PresetInfo} module
     */
    loadPreset(module: PresetName, meta?: object, { shallow: boolean }?): PresetInfo;
    /**
     * Loads presets and plugins as configured.
     * Plugins will be filtered and ordered as configuration with priority of:
     *  - added plugins > preset plugins > nested preset plugins
     *
     * @param {object}                config         - Presets and plugins to load
     * @param {PresetName[]}          config.presets - Presets to load and add plugins from
     * @param {PluginName[]|module[]} config.add     - Names of plugins to load
     * @param {string[]}              [config.remove] - Names of plugins to remove (from presets)
     * @returns {{presets: PresetInfo[], plugins: PluginInfo[]}} results
     */
    loadConfigured(config: {
        presets: PresetName[];
        add: PluginName[] | object[];
        remove?: PluginName[];
    }): {
        presets: PresetInfo[];
        plugins: PluginInfo[];
    };
}
