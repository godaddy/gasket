import type { MaybeAsync, Plugin } from '@gasket/engine';
import type { PackageJson } from '@gasket/cli';
import type { ModuleData, PluginData } from '@gasket/plugin-metadata';

export interface DocsSetupModulesConfig {
  [key: string]: DocsSetup;
}

export interface DocsTransformHandlerData {
  filename: string;
  docsConfig: ModuleDocsConfig;
  docsConfigSet: DocsConfigSet;
}

export type DocsTransformHandler = (
  content: string,
  data: DocsTransformHandlerData
) => string;

export interface DocsTransform {
  global?: boolean;
  test: RegExp;
  handler: DocsTransformHandler;
}

export interface DocsSetup {
  link?: string;
  files?: Array<string>;
  transforms?: Array<DocsTransform>;
  modules?: DocsSetupModulesConfig;
  description?: string;
}

export interface DocsConfig {
  name: string;
  description?: string;
  deprecated?: boolean;
  link?: string;
  sourceRoot?: string;
  targetRoot?: string;
}

export interface ModuleDocsConfig extends DocsConfig {
  files: Array<string>;
  transforms: Array<DocsTransform>;
  metadata: ModuleData;
  version: string;
}

export interface DetailDocsConfig extends DocsConfig {
  from?: string;
}

export interface LifecycleDocsConfig extends DetailDocsConfig {
  method: string;
  parent?: string;
  command?: string;
  after?: string;
}

export interface DocsConfigSet extends PluginData {
  name?: string;
  module?: Module;
  app: ModuleDocsConfig;
  docsRoot: string;
  plugins: Array<ModuleDocsConfig>;
  presets: Array<ModuleDocsConfig>;
  root: string;
  transforms: Array<DocsTransform>;
}

export interface LinkTransform {
  (callback: (link: string) => string): (content: string) => string;
}

declare module '@gasket/engine' {
  export interface GasketConfig {
    docs?: {
      outputDir?: string;
    };
  }

  export interface HookExecTypes {
    docsSetup(args: { defaults: DocsSetup }): MaybeAsync<DocsSetup>;

    docsView(docs: DocsConfigSet): MaybeAsync<void>;

    docsGenerate(
      docs: DocsConfigSet
    ): MaybeAsync<Omit<DetailDocsConfig, 'sourceRoot'>>;
  }
}

/**
 * Searches for the pluginData from metadata for a given plugin. If the plugin
 * does not have a name, a unique match by hooks is attempted, otherwise a
 * console warning is issued.
 */
export function findPluginData(
  /** Plugin instance to look up info for */
  plugin: Plugin,
  /** Metadata for plugins */
  pluginsDatas: PluginData[],
  logger: Log
): PluginData | undefined;

/**
 * Processes metadata and docsSetup hooks to assemble the set of docs configs
 *
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

/** Look up all doc files for a module */
async function _findAllFiles(
  moduleData: ModuleData,
  docsSetup: DocsSetup,
  /** Main file */
  link: string,
  /** Absolute path to the module's package */
  sourceRoot?: string
): Promise<string[]>;

/**
 * Divides global and local transforms from a docsSetup. Global transforms are
 * added to the top-level set. Local transforms will be added to the module's
 * docConfig.
 */
export function _segregateTransforms(
  /** Transforms to segregate */
  transforms: DocsTransform[]
): DocsTransform[];

export interface Overrides {
  sourceRoot?: string;
  targetRoot?: string;
  name?: string;
}

/** Constructs the DocsConfig for a module based on its info and docsSetup */
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

/** Add DocsConfig to the set for the App */
export async function addApp(
  /** Metadata for app module */
  moduleData: ModuleData,
  /** Initial docs setup */
  docsSetup?: DocsSetup
): Promise<void>;

export async function addPlugin(
  pluginData: PluginData,
  docsSetup?: DocsSetup
): Promise<void>;

export async function addPlugins(
  /** Metadata for multiple plugins */
  pluginsDatas: PluginData[]
): Promise<void>;

export async function addPreset(
  presetData: PresetData,
  docsSetup?: DocsSetup
): Promise<void>;

export async function addPresets(
  /** Metadata for multiple presets */
  presetsDatas: PresetData[]
): Promise<void>;

export async function addModule(
  moduleData: ModuleData,
  docsSetup?: DocsSetup
): Promise<void>;

export async function addModules(
  /** Metadata for multiple modules */
  modulesDatas: ModuleData[]
): Promise<void>;

/** Picks out properties to return as the config set */
export function getConfigSet(): DocsConfigSet;

declare module '@gasket/plugin-metadata' {
  export interface DetailData {
    targetRoot?: string;
  }
}
