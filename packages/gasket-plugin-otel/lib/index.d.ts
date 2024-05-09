import { MaybeAsync } from '@gasket/engine';
import { CreateContext } from 'create-gasket-app';

export interface ProcessEnv {
  [key: string]: string | undefined
}

declare module '@gasket/engine' {
  export interface HookExecTypes {
    create(context: CreateContext): MaybeAsync<void>;
  }
}
