import type { MaybeAsync } from '@gasket/engine';

export interface ModuleData<Module = any> {
  /** Name of preset */
  name: string,

  /** Actual module content */
  module: Module,

  /** Package.json contents */
  package?: PackageJson,

  /** Resolved version */
  version?: string,

  /** Path to the root of package */
  path?: string,

  /** Name of module which requires this module */
  from?: string,
  
  /** Range by which this module was required */
  range?: string,
  
  /** Path to a doc file or URL */
  link?: string
}

/** App module with meta data */
export interface AppData extends ModuleData {
  /** Description of modules supporting this plugin */
  modules?: Array<DetailData>
}

/** Plugin module with meta data */
export interface PluginData extends ModuleData {
  /** Commands enabled by this plugin */
  commands?: Array<DetailData>,

  /** App files and directories used by plugin */
  structures?: Array<DetailData>,

  /** Description of lifecycles invoked by plugin */
  lifecycles?: Array<LifecycleData>,

  /** Description of modules supporting this plugin */
  modules?: Array<string | DetailData>
}

/** Preset module with meta data */
export interface PresetData extends ModuleData {
  /** Presets that this preset extends */
  presets: Array<PresetData>,

  /** Plugins this preset uses */
  plugins: Array<PluginData>,
}

/** Metadata for details of a plugin */
export interface DetailData {
  /** Name of the the module or element */
  name: string,

  /** Description of the module or element */
  description?: string,

  /** Path to a doc file or URL */
  link?: string
}

/** Metadata with specifics details for plugin lifecycles */
export interface LifecycleData extends DetailData {
  /** Executing method from the engine */
  method: string,

  /** Lifecycle from which this one is invoked */
  parent?: string,

  /** Command from which this lifecycle is invoked */
  command?: string
}

/** Collection data for modules configured for app */
export interface Metadata {
  /** App and main package data */
  app: Array<AppData>,

  /** Preset data with dependency hierarchy */
  presets: Array<PresetData>,

  /** Flat list of registered plugin data */
  plugins: Array<PluginData>,

  /** Supporting module data */
  modules: Array<ModuleData>
}

declare module '@gasket/engine' {
  export interface HookExecTypes {
    metadata(origData: PluginData): MaybeAsync<PluginData>
  }
}
