import type { Configuration } from 'webpack';
declare module '@gasket/engine' {
  export type MaybeMultiple<T> = T | Array<T>;
  export type MaybeAsync<T> = T | Promise<T>;
  export type ResolvedType<T> = T extends Promise<infer Value> ? Value : T;

  // To be extended by plugins
  export interface HookExecTypes {}

  export type HookId = keyof HookExecTypes;

  export type HookTimings = {
    before?: Array<string>;
    after?: Array<string>;
    first?: boolean;
    last?: boolean;
  };

  export type HookHandler<Id extends HookId> = (
    gasket: Gasket,
    ...args: Parameters<HookExecTypes[Id]>
  ) => ReturnType<HookExecTypes[Id]>;

  export type ApplyHookHandler<Id extends HookId> = (
    ...args: Parameters<HookExecTypes[Id]>
  ) => ReturnType<HookExecTypes[Id]>;

  type HookWithTimings<Id extends HookId> = {
    timing: HookTimings;
    handler: HookHandler<Id>;
  };

  export type Hook<Id extends HookId> = HookWithTimings<Id> | HookHandler<Id>;

  export type Plugin = {
    name: string;
    dependencies?: Array<string>;
    hooks: {
      [K in HookId]?: Hook<K>;
    };
  };

  // This is the config
  export interface GasketConfig {
    root: string;
    env: string;
  }

  export default class GasketEngine {
    constructor(config: GasketConfigFile, context?: { resolveFrom?: string });
    config: GasketConfig;

    exec<Id extends HookId>(
      hook: Id,
      ...args: Parameters<HookExecTypes[Id]>
    ): Promise<ResolvedType<ReturnType<HookExecTypes[Id]>>[]>;
    execSync<Id extends HookId>(
      hook: Id,
      ...args: Parameters<HookExecTypes[Id]>
    ): Promise<ResolvedType<ReturnType<HookExecTypes[Id]>>[]>;
    execWaterfall<Id extends HookId>(
      hook: Id,
      ...args: Parameters<HookExecTypes[Id]>
    ): ReturnType<HookExecTypes[Id]>;
    execWaterfallSync<Id extends HookId>(
      hook: Id,
      ...args: Parameters<HookExecTypes[Id]>
    ): ReturnType<HookExecTypes[Id]>;
    execApply<Id extends HookId, Return = void>(
      hook: Id,
      callback: (
        plugin: Plugin,
        handler: ApplyHookHandler<Id>
      ) => Promise<Return>
    ): Promise<Return[]>;
    execApplySync<Id extends HookId, Return = void>(
      hook: Id,
      callback: (plugin: Plugin, handler: ApplyHookHandler<Id>) => Return
    ): Return[];

    hook<Id extends HookId>(opts: {
      event: Id;
      pluginName?: string;
      timing?: HookTimings;
      handler: HookHandler<Id>;
    }): void;
  }

  export interface Gasket extends GasketEngine {
    command: {
      id: string;
    };
  }

  type PartialRecursive<T> = T extends Object
    ? { [K in keyof T]?: PartialRecursive<T[K]> } | undefined
    : T | undefined;

  type Plugins = {
    plugins?: {
      presets?: Array<string>;
      add?: Array<string | Plugin>;
      remove?: Array<string>;
    };
  };

  export type GasketConfigFile = Omit<
    GasketConfig,
    'root' | 'env' | 'command'
  > &
    Plugins & {
      root?: string;
      env?: string;

      environments?: Record<string, PartialRecursive<GasketConfig & Plugins>>;
    };
}
