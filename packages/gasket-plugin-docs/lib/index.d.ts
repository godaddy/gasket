import type { MaybeAsync, Plugin } from '@gasket/core';

import type {
  DocsConfigSet,
  DocsSetup,
  DetailDocsConfig
} from './internal';

declare module 'create-gasket-app' {
  export interface CreateContext {
    useDocs?: boolean;
  }
}

declare module '@gasket/core' {
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

declare const plugin: Plugin;

export default plugin;

