import type { MaybeAsync } from '@gasket/core';

declare module '@gasket/core' {
  export interface HookExecTypes {
    build(): MaybeAsync<void>,
    preboot(): MaybeAsync<void>,
    start(): MaybeAsync<void>
  }
}

export default {
  name: '@gasket/plugin-start',
  hooks: {}
};
