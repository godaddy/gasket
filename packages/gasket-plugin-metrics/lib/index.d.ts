import type { GasketConfig, MaybeAsync, CoreHookExecTypes } from '@gasket/core';

export interface Metrics {
  name: string;
  version: string;
  gasket: Record<string, string>;
  repository: string;
  branch: string;
  config: GasketConfig;
  system: {
    platform: string;
    release: string;
    arch: string;
  };
  env: string;
  argv: any;
  time: number;
  cmd: string;
}

declare module '@gasket/core' {
  export interface HookExecTypes extends CoreHookExecTypes {
    metrics(metrics: Metrics): MaybeAsync<void>;
  }
}
