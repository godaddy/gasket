/* eslint-disable no-use-before-define */
declare module '@gasket/core' {
  /**
   * Allows a type to be a single value or an array of that type.
   * Useful for handling cases where a function accepts multiple values.
   */
  export type MaybeMultiple<T> = T | Array<T>;

  /**
   * Allows a type to be synchronous or asynchronous.
   * Used for functions that may return a Promise or a direct value.
   */
  export type MaybeAsync<T> = T | Promise<T>;

  /**
   * Extracts the resolved value from a Promise type.
   * If the type is not a Promise, it remains unchanged.
   */
  export type ResolvedType<T> = T extends Promise<infer Value> ? Value : T;

  export interface GasketActions { }

  export type ActionId = keyof GasketActions;

  export type ActionHandler<Id extends ActionId> = (
    gasket: Gasket,
    ...args: Parameters<GasketActions[Id]>
  ) => ReturnType<GasketActions[Id]>;

  /**
   * Defines the lifecycle hooks that Gasket supports.
   * Plugins can extend this interface to add additional lifecycle hooks.
   */
  export interface HookExecTypes {
    /** Runs during initialization */
    init(): void;
    /** Runs during configuration and can modify the configuration */
    configure(config: GasketConfig): GasketConfig;
    /** Runs when the application is ready */
    ready(): MaybeAsync<void>;
    /** Runs when preparing the application */
    prepare(config: GasketConfig): MaybeAsync<GasketConfig>;
  }

  /**
   * Extracts the available hook names from `HookExecTypes`.
   */
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
    metadata?: Record<string, any>;
  };

  export type Preset = Omit<Plugin, 'actions'>;

  /**
   * Defines the base configuration for a Gasket application.
   */
  export interface GasketConfig {
    plugins: Plugin[];
    root: string;
    env: string;
    command?: string;
  }

  /**
   * Represents a Gasket configuration before it has been fully normalized.
   * Supports both direct Plugin objects and ES module Plugin imports.
   */
  export type PreNormalizedGasketConfig = Omit<GasketConfig, 'plugins'> & {
    plugins: (Plugin | { default: Plugin })[];
  };

  /**
   * The core Gasket engine that manages plugins and lifecycle hooks.
   */
  export class GasketEngine {
    constructor(plugins: Plugin[]);

    actions: GasketActions;

    registerPlugins(plugins: Plugin[]): void;
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
    ): Promise<ResolvedType<ReturnType<HookExecTypes[Id]>>>;
    execWaterfallSync<Id extends HookId>(
      hook: Id,
      ...args: Parameters<HookExecTypes[Id]>
    ): ResolvedType<ReturnType<HookExecTypes[Id]>>;
    execMap<Id extends HookId>(
      hook: Id,
      ...args: Parameters<HookExecTypes[Id]>
    ): Promise<Record<string, ResolvedType<ReturnType<HookExecTypes[Id]>>>>;
    execMapSync<Id extends HookId>(
      hook: Id,
      ...args: Parameters<HookExecTypes[Id]>
    ): Record<string, ResolvedType<ReturnType<HookExecTypes[Id]>>>;
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

  /**
   * Represents a Gasket instance.
   */
  export class Gasket extends GasketEngine {
    constructor(config: GasketConfigDefinition);
    new(config: GasketConfigDefinition): Gasket;

    isReady: Promise<void>;
    command: string;
    config: GasketConfig;
    engine: GasketEngine;
    symbol: Symbol;
    traceBranch(): GasketTrace;
    traceRoot(): Gasket;
  }

  /**
   * A proxy type for tracing Gasket operations.
   */
  export type GasketTrace = typeof Proxy<Gasket> & {
    trace: (msg: string) => void
  };

  type PartialRecursive<T> = T extends Object
    ? { [K in keyof T]?: PartialRecursive<T[K]> } | undefined
    : T | undefined;

  // Allow nested merging of most config
  type ConfigKeysRequiringFullEnvConfig = 'plugins';
  type GasketConfigOverrides =
    & PartialRecursive<Omit<GasketConfigDefinition, ConfigKeysRequiringFullEnvConfig>>
    & Partial<Pick<GasketConfigDefinition, ConfigKeysRequiringFullEnvConfig>>;

  export type GasketConfigDefinition = Omit<PreNormalizedGasketConfig, 'root' | 'env' | 'command'> & {
    root?: string
    env?: string
    environments?: Record<string, GasketConfigOverrides>
    commands?: Record<string, GasketConfigOverrides>
  }

  /**
   * Represents a simplified request shape for actions.
   * @deprecated - Use class from `@gasket/request` instead.
   */
  export interface GasketRequest {
    cookies: Record<string, string>;
    headers: Record<string, string>;
    query?: Record<string, string>;
  }

  /**
   * Creates a new Gasket application with the given configuration.
   */
  export function makeGasket(config: GasketConfigDefinition): Gasket;
}
