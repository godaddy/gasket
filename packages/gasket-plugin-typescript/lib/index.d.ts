import { gasket } from 'gasket.ts';
import { MaybeAsync } from '@gasket/core';
import { CreateContext } from 'create-gasket-app';

declare module '@gasket/core' {
  export interface HookExecTypes {
    create(context: CreateContext): MaybeAsync<void>;
  }
}

export default {
  name: '@gasket/plugin-typescript',
  hooks: {}
};
