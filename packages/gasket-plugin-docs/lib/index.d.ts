import { DocsSetup } from './index.d';
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
    filename: String,
    docsConfig: ModuleDocsConfig,
    docsConfigSet: DocsConfigSet,
  }

  export interface DocsTransformHandler {
    content: String,
    data: DocsTransformHandlerData,
  }

  export interface DocsTransform {
    global?: Boolean,
    test: RegExp,
    handler: DocsTransformHandler
  }

  export interface DocsSetup {
    link: String,
    files?: Array<String>,
    transforms?: Array<DocsTransform>,
    modules?: DocsSetupModulesConfig
  }

  export interface DocsConfig {
    name: String,
    description?: String,
    link?: String,
    sourceRoot: String,
    targetRoot: String
  }

  export interface ModuleDocsConfig extends DocsConfig {
    files: Array<String>,
    transforms: Array<DocsTransform>,
    metadata: ModuleData
  }

  export interface DetailDocsConfig extends DocsConfig {
    from: String
  }

  export interface LifecycleDocsConfig extends DetailDocsConfig {
    method: String,
    parent?: String,
    command?: String
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
