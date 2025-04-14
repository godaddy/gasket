import type { Plugin } from '@gasket/core';
import type { Gitignore } from './internal';

declare module 'create-gasket-app' {
  export interface CreateContext {
    gitignore?: Gitignore;
  }
}

declare const plugin: Plugin;

export default plugin;
