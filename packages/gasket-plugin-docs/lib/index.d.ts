import type { MaybeAsync, Plugin } from '@gasket/engine';

import type {
  DocsConfigSet,
  DocsSetup,
  DetailDocsConfig
} from './internal';

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

declare module '@gasket/plugin-metadata' {
  export interface DetailData {
    targetRoot?: string;
  }
}
