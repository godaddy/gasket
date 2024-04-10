import { MaybeAsync } from '@gasket/engine';
import { CreateContext } from '../../create-gasket-app/lib';

declare module '@gasket/engine' {
  export interface HookExecTypes {
    create(context: CreateContext): MaybeAsync<void>;
  }
}
