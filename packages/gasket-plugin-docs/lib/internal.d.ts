import type { Plugin } from '@gasket/core';
import type { PackageJson } from 'create-gasket-app';
import type {
  ModuleData,
  PluginData,
  PresetData
} from '@gasket/plugin-metadata';

/**
 * Configuration for setting up documentation modules.
 */
export interface DocsSetupModulesConfig {
  [key: string]: DocsSetup;
}

/**
 * Data structure for handling transformations on documentation files.
 */
export interface DocsTransformHandlerData {
  /** Name of the file */
  filename: string;
  /** Configuration for the documentation module */
  docsConfig: ModuleDocsConfig;
  /** Set of documentation configurations */
  docsConfigSet: DocsConfigSet;
}

/**
 * Transformation function for documentation files.
 */
export type DocsTransformHandler = (
  /** Content of the file */
  content: string,
  /** Data for transformation */
  data: DocsTransformHandlerData
) => string;

/**
 * Configuration for a documentation transformation.
 */
export interface DocsTransform {
  /** Indicates if the transformation is global */
  global?: boolean;
  /** Regular expression to match files */
  test: RegExp;
  /** Transformation function */
  handler: DocsTransformHandler;
}

/**
 * Configuration for setting up documentation.
 */
export interface DocsSetup {
  /** Link to documentation */
  link?: string;
  /** List of files */
  files?: string[];
  /** List of transformations */
  transforms?: DocsTransform[];
  /** Configuration for documentation modules */
  modules?: DocsSetupModulesConfig;
  /** Description of the documentation */
  description?: string;
}

/**
 * Configuration for documentation.
 */
export interface DocsConfig {
  /** Name of the documentation */
  name: string;
  /** Description of the documentation */
  description?: string;
  /** Indicates if the documentation is deprecated */
  deprecated?: boolean;
  /** Link to the documentation */
  link?: string;
  /** Root directory of the source files */
  sourceRoot?: string;
  /** Root directory of the target files */
  targetRoot?: string;
}

/**
 * Configuration for a documentation module.
 */
export interface ModuleDocsConfig extends DocsConfig {
  /** List of files */
  files: string[];
  /** List of transformations */
  transforms: DocsTransform[];
  /** Metadata for the module */
  metadata: ModuleData;
  /** Version of the module */
  version: string;
}

/**
 * Configuration for detailed documentation.
 */
export interface DetailDocsConfig extends DocsConfig {
  /** Origin of the detail */
  from?: string;
}

/**
 * Configuration for lifecycle documentation.
 */
export interface LifecycleDocsConfig extends DetailDocsConfig {
  /** Method of the lifecycle */
  method: string;
  /** Parent of the lifecycle */
  parent?: string;
  /** Command of the lifecycle */
  command?: string;
  /** Lifecycle after another */
  after?: string;
}

/**
 * Configuration set for documentation.
 */
export interface DocsConfigSet extends PluginData {
  /** Name of the documentation */
  name?: string;
  /** Module of the documentation */
  module?: Module;
  /** Configuration for the app */
  app: ModuleDocsConfig;
  /** Root directory of the documentation */
  docsRoot: string;
  /** List of plugins */
  plugins: ModuleDocsConfig[];
  /** List of presets */
  presets: ModuleDocsConfig[];
  /** Root directory */
  root: string;
  /** List of transformations */
  transforms: DocsTransform[];
}

export interface LinkTransform {
  (callback: (link: string) => string): (content: string) => string;
}

/**
 * Function to find plugin data from metadata for a given plugin.
 */
export function findPluginData(
  /** Plugin instance to look up info for */
  plugin: Plugin,
  /** Metadata for plugins */
  pluginsDatas: PluginData[],
  logger: Log
): PluginData | undefined;

/**
 * Function to build the documentation configuration set.
 * Order of operations for building docsConfig:
 * - docsSetup hooked plugins
 * - metadata or docsSetup lifecycle file for app
 * - metadata for plugins without docsSetup hook
 * - metadata for modules not processed with plugins
 * - metadata for presets
 */
export async function buildDocsConfigSet(
  gasket: Gasket
): Promise<DocsConfigSet>;

/**
 * Function to find all documentation files for a module.
 */
async function _findAllFiles(
  /** Metadata for the module. */
  moduleData: ModuleData,
  /** Documentation setup. */
  docsSetup: DocsSetup,
  /** Main file */
  link: string,
  /** Absolute path to the module's package */
  sourceRoot?: string
): Promise<string[]>;

/**
 * Function to segregate global and local transforms from a docsSetup.
 */
export function _segregateTransforms(
  /** Transforms to segregate */
  transforms: DocsTransform[]
): DocsTransform[];

/**
 * Function to build the documentation configuration for a module.
 */
export async function _buildDocsConfig(
  /** Metadata for module */
  moduleData: ModuleData,
  /** Files to include and transforms */
  docsSetup?: DocsSetup,
  /** Pre-configured properties */
  overrides?: Overrides
): Promise<ModuleDocsConfig>;

/** Flattens all detail types from plugins' metadata. Add a from property with
 * name of parent plugin. */
function _flattenDetails(
  /** Detail type in metadata */
  type: string
): DetailDocsConfig[];

/**
 * Adds additional docsSetup for modules, merging duplicates with a first in
 * wins approach. When a module is then add to be configured, a docSetup will
 * be looked up from what's been added by plugins here.
 */
export function _addModuleDocsSetup(
  /** Setups for modules */
  moduleDocsSetup: Record<string, DocsSetup>
): void;

/**
 * Function to add documentation configuration for the app.
 */
export async function addApp(
  /** Metadata for app module */
  moduleData: ModuleData,
  /** Initial docs setup */
  docsSetup?: DocsSetup
): Promise<void>;

/**
 * Function to add documentation configuration for a plugin.
 */
export async function addPlugin(
  /** Metadata for the plugin. */
  pluginData: PluginData,
  /** Initial documentation setup. */
  docsSetup?: DocsSetup
): Promise<void>;

/**
 * Function to add documentation configuration for multiple plugins.
 */
export async function addPlugins(
  /** Metadata for multiple plugins. */
  pluginsDatas: PluginData[]
): Promise<void>;

/**
 * Function to add documentation configuration for a preset.
 */
export async function addPreset(
  /** Metadata for the preset. */
  presetData: PresetData,
  /** Initial documentation setup. */
  docsSetup?: DocsSetup
): Promise<void>;

/**
 * Function to add documentation configuration for multiple presets.
 */
export async function addPresets(
  /** Metadata for multiple presets. */
  presetsDatas: PresetData[]
): Promise<void>;

/**
 * Function to add documentation configuration for a module.
 */
export async function addModule(
  /** Metadata for the module. */
  moduleData: ModuleData,
  /** Initial documentation setup. */
  docsSetup?: DocsSetup
): Promise<void>;

/**
 * Function to add documentation configuration for multiple modules.
 */
export async function addModules(
  /** Metadata for multiple modules. */
  modulesDatas: ModuleData[]
): Promise<void>;

/**
 * Function to get the configuration set.
 */
export function getConfigSet(): DocsConfigSet;
