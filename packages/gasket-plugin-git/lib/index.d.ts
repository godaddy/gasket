import type { Plugin } from '@gasket/core';
import type { Gitignore } from './internal';

declare module 'create-gasket-app' {
  export interface CreateContext {
    gitignore?: Gitignore;
  }
}

const plugin: Plugin = {
  name: '@gasket/plugin-git',
  hooks: {}
};

export = plugin;
