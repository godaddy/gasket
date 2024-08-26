declare module '@gasket/core' {
  export type MaybeMultiple<T> = T | Array<T>;
  export type MaybeAsync<T> = T | Promise<T>;
  export type ResolvedType<T> = T extends Promise<infer Value> ? Value : T;

  export interface GasketActions {}

  export type ActionId = keyof GasketActions;

  export type ActionHandler<Id extends ActionId> = (
    gasket: Gasket,
    ...args: Parameters<GasketActions[Id]>
  ) => ReturnType<GasketActions[Id]>;


  // To be extended by plugins
  export interface HookExecTypes {
    // add makeGasket lifecycles
    init(): void
    configure(config: GasketConfig): GasketConfig
    ready(): MaybeAsync<void>
  }

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
    version?: string;
    description?: string;
    dependencies?: Array<string>;
    hooks: {
      [K in HookId]?: Hook<K>;
    };
    actions?: {
      [K in ActionId]?: ActionHandler<K>;
    };
  };

  export type Preset = Omit<Plugin, 'actions'>;

  // This is the config
  export interface GasketConfig {
    plugins: Array<Plugin>;
    root: string;
    env: string;
  }

  export class GasketEngine {
    constructor(plugins: Array<Plugin>);

    actions: GasketActions

    exec<Id extends HookId>(
      hook: Id,
      ...args: Parameters<HookExecTypes[Id]>
    ): Promise<ResolvedType<ReturnType<HookExecTypes[Id]>>[]>;
    execSync<Id extends HookId>(
      hook: Id,
      ...args: Parameters<HookExecTypes[Id]>
    ): ResolvedType<ReturnType<HookExecTypes[Id]>>[];
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
    constructor(config: GasketConfigDefinition);

    command: {
      id: string;
    };
    config: GasketConfig;
    new (config: GasketConfigDefinition): Gasket
    traceBranch(): GasketTrace
    traceRoot(): Gasket
  }

  export type GasketTrace = Proxy<Gasket>;

  type PartialRecursive<T> = T extends Object
    ? { [K in keyof T]?: PartialRecursive<T[K]> } | undefined
    : T | undefined;

  export type GasketConfigDefinition = Omit<GasketConfig, 'root' | 'env' | 'command'> & {
    root?: string
    env?: string
    environments?: Record<string, Partial<GasketConfigDefinition>>
    commands?: Record<string, Partial<GasketConfigDefinition>>
  }

  /**
   * Expected request shape for GasketActions
   */
  export interface GasketRequest {
    cookies: Record<string, string>;
    headers: Record<string, string>;
    query?: Record<string, string>;
  }

  export function makeGasket(config: GasketConfigDefinition): Gasket
}
