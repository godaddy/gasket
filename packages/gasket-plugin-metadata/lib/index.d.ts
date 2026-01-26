import type { MaybeAsync, Plugin } from '@gasket/core';
import type { PackageJson } from 'create-gasket-app';

/** Metadata for details of a plugin */
export interface DetailData {
  name: string;
  version?: string;
  description?: string;
  link?: string;
  targetRoot?: string;
}

/** Metadata for plugin configuration properties */
interface ConfigurationsData extends DetailData {
  /** Configuration property type */
  type: string;
  default?: string | string[] | boolean | number;
}

/** Metadata with specifics details for plugin lifecycles */
interface LifecycleData extends DetailData {
  /** Executing method from the engine */
  method?: string;
  /** Lifecycle from which this one is invoked */
  parent?: string;
  /** Command from which this lifecycle is invoked */
  command?: string;
  after?: string;
  from?: string;
  deprecated?: boolean;
}

/** Generic module data */
export interface ModuleData {
  name: string;
  package?: PackageJson;
  version?: string;
  path?: string;
  from?: string;
  range?: string;
  link?: string;
  description?: string;
  metadata?: Record<string, any> & { name: string };
}

/** Plugin module with meta data */
export interface PluginData extends ModuleData {
  commands?: Array<DetailData>;
  actions?: Array<DetailData>;
  structures?: Array<DetailData>;
  configurations?: Array<ConfigurationsData>;
  lifecycles?: Array<LifecycleData>;
  modules?: Array<DetailData>;
  guides?: Array<DetailData>;
  templates?: Array<DetailData>;
  hooks?: Record<string, Function>;
}

/** App module with meta data */
interface AppData extends ModuleData {
  /** Description of modules supporting this plugin */
  modules?: Array<DetailData>;
}

/** Collection data for modules configured for app */
export interface Metadata {
  app: AppData;
  plugins: Array<PluginData>;
  modules: Array<ModuleData>;
}

declare module '@gasket/core' {
  interface HookExecTypes {
    metadata(origData: PluginData): MaybeAsync<PluginData>;
  }

  interface GasketActions {
    getMetadata(): Promise<Metadata>;
  }
}

declare const plugin: Plugin;
export default plugin;
