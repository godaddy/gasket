import type { HookExecTypes, MaybeAsync } from '@gasket/engine';
import type { DetailData, PluginData } from '@gasket/plugin-metadata';

declare module '@gasket/engine' {
  export interface GasketConfig {
    docs?: {
      outputDir?: string
    }
  }

  // TODO: correctly document what the full payload is...
  type DocsConfigSet = {
    docsRoot: string
  };

  export interface HookExecTypes {
    docsSetup(args: { defaults: PluginData }): MaybeAsync<PluginData & {
      files?: Array<string>,
      transforms?: Array<{
        test: RegExp,
        global?: boolean,
        handler: (content: string) => string
      }>
    }>;
    
    docsView(docs: DocsConfigSet): MaybeAsync<void>;

    docsGenerate(docs: DocsConfigSet): MaybeAsync<DetailData>
  }
}
