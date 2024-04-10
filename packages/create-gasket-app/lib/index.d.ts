import type { GasketConfigFile, MaybeAsync } from '@gasket/engine';
import type { PackageManager } from '@gasket/utils';
import type { Command } from 'commander';
import type { CreateContext } from '@gasket/cli';

declare module '@gasket/engine' {
  export interface HookExecTypes {
    prompt(
      context: CreateContext,
      utils: {
        prompt: (prompts: Array<Record<string, any>>) => Promise<Record<string, any>>,
        addPlugins: (plugins: Array<string>) => Promise<void>
      }
    ): MaybeAsync<CreateContext>;

    create(context: CreateContext): MaybeAsync<void>;

    postCreate(
      context: CreateContext,
      utils: {
        runScript: (script: string) => Promise<void>
      }): MaybeAsync<void>;
  }
}
