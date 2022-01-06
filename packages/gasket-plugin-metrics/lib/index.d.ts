import type { GasketConfig, MaybeAsync } from "@gasket/engine";

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

declare module "@gasket/engine" {
  export interface HookExecTypes {
    metrics(metrics: Metrics): MaybeAsync<void>;
  }
}
