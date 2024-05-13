import type { Gitignore } from './internal';

declare module '@gasket/cli' {
  export interface CreateContext {
    gitignore?: Gitignore;
  }
}
