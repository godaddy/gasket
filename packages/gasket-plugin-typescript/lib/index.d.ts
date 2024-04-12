import { MaybeAsync } from '@gasket/engine';
import { CreateContext } from '@gasket/cli';

declare module '@gasket/engine' {
  export interface HookExecTypes {
    create(context: CreateContext): MaybeAsync<void>;
  }
}
