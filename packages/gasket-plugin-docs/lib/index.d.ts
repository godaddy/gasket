import type { MaybeAsync, Plugin, GasketConfig } from '@gasket/core';
import type { GasketCommandDefinition } from '@gasket/plugin-command';

import type {
  DocsConfigSet,
  DocsSetup,
  DetailDocsConfig
} from './internal';

declare module '@gasket/core' {
  export interface GasketConfig {
    docs?: {
      outputDir?: string;
    };
  }

  export interface HookExecTypes {
    configure(config: GasketConfig): GasketConfig

    commands(): GasketCommandDefinition;

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

export default {
  name: '@gasket/plugin-docs',
  hooks: {}
};
