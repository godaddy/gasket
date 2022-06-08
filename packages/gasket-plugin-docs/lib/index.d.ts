import { ModuleData } from './../../gasket-plugin-metadata/lib/index.d';
import type { HookExecTypes, MaybeAsync } from '@gasket/engine';
import type { DetailData, PluginData } from '@gasket/plugin-metadata';

declare module '@gasket/engine' {
  export interface GasketConfig {
    docs?: {
      outputDir?: string
    }
  }

  export interface DocsSetupModulesConfig {
    [key: string]: DocsSetup
  }

  export interface DocsTransformHandlerData {
    filename: string,
    docsConfig: ModuleDocsConfig,
    docsConfigSet: DocsConfigSet,
  }

  export interface DocsTransformHandler {
    content: string,
    data: DocsTransformHandlerData,
  }

  export interface DocsTransform {
    global?: boolean,
    test: RegExp,
    handler: DocsTransformHandler
  }

  export interface DocsSetup {
    link: string,
    files?: Array<string>,
    transforms?: Array<DocsTransform>,
    modules?: DocsSetupModulesConfig
  }

  export interface DocsConfig {
    name: string,
    description?: string,
    link?: string,
    sourceRoot: string,
    targetRoot: string
  }

  export interface ModuleDocsConfig extends DocsConfig {
    files: Array<string>,
    transforms: Array<DocsTransform>,
    metadata: ModuleData
  }

  export interface DetailDocsConfig extends DocsConfig {
    from: string
  }

  export interface LifecycleDocsConfig extends DetailDocsConfig {
    method: string,
    parent?: string,
    command?: string
  }
  export interface DocsConfigSet {
    app: ModuleDocsConfig,
    plugins: Array<ModuleDocsConfig>,
    presets: Array<ModuleDocsConfig>,
    modules: Array<ModuleDocsConfig>,
    structures: Array<DetailDocsConfig>,
    commands: Array<DetailDocsConfig>,
    guides: Array<DetailDocsConfig>,
    lifecycles: Array<LifecycleDocsConfig>,
    transforms: Array<DocsTransform>,
    root: string,
    docsRoot: string
  }
  export interface HookExecTypes {
    docsSetup(args: { defaults: PluginData }): MaybeAsync<PluginData & {
      files?: Array<string>,
      transforms?: Array<{
        test: RegExp,
        global?: boolean,
        handler: (content: string, data: DocsTransformHandlerData) => string
      }>
    }>;

    docsView(docs: DocsConfigSet): MaybeAsync<void>;

    docsGenerate(docs: DocsConfigSet): MaybeAsync<DetailData>
  }
}
