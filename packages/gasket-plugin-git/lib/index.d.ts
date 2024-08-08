import type { Gitignore } from './internal';

declare module 'create-gasket-app' {
  export interface CreateContext {
    gitignore?: Gitignore;
  }
}

export = {
  name: '@gasket/plugin-git',
  version: '',
  description: '',
  hooks: {}
};
