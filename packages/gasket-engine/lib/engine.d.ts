declare module '@gasket/engine' {
  export type MaybeMultiple<T> = T | Array<T>;
  export type MaybeAsync<T> = T | Promise<T>;
  export type ResolvedType<T> = T extends Promise<infer Value> ? Value : T;

  // To be extended by plugins
  export interface HookExecTypes {}

  export type HookId = keyof HookExecTypes

  export type HookHandler<Id extends HookId> = (
    gasket: Gasket,
    ...args: Parameters<HookExecTypes[Id]>
  ) => ReturnType<HookExecTypes[Id]>;    
  
  type HookWithTimings<Id extends HookId> = {
    timing: {
      before?: Array<string>;
      after?: Array<string>;
      first?: boolean;
      last?: boolean;
    };
    handler: HookHandler<Id>;
  };
  
  export type Hook<Id extends HookId> = HookWithTimings<Id> | HookHandler<Id>;

  export type Plugin = {
    name: string;
    hooks: {
      [K in HookId]?: Hook<K>;
    };
  };

  // This is the config 
  export interface GasketConfig {
    root: string,
    env: string
  }

  export interface Gasket {
    config: GasketConfig;

    exec<Id extends HookId>(
      hook: Id,
      ...args: Parameters<HookExecTypes[Id]>
    ): Promise<Array<ResolvedType<ReturnType<HookExecTypes[Id]>>>>;

    execSync<Id extends HookId>(
      hook: Id,
      ...args: Parameters<HookExecTypes[Id]>
    ): Promise<Array<ResolvedType<ReturnType<HookExecTypes[Id]>>>>;

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
      callback: (plugin: Plugin | null, handler: HookHandler<Id>) => Promise<Return>
    ): Promise<Array<Return>>

    execApplySync<Id extends HookId, Return = void>(
      hook: Id,
      callback: (plugin: Plugin | null, handler: HookHandler<Id>) => Return
    ): Array<Return>
  }

  type PartialRecursive<T> = 
    T extends Object
      ? { [K in keyof T]?: PartialRecursive<T[K]> } | undefined
      : T | undefined

  export type GasketConfigFile = Omit<GasketConfig, 'root' | 'env'> & {
    root?: string,
    env?: string,

    plugins?: {
      presets?: Array<string>;
      add?: Array<string | Plugin>;
      remove?: Array<string>;
    },

    environments?: Record<string, PartialRecursive<GasketConfig>>
  }
}
