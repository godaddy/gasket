/* ----------------------- *
 *    Utility Types       *
 * ----------------------- */

/**
 * Allows a value to be a single item or an array of items. Useful for handling cases where a function accepts multiple values.
 */
export type MaybeMultiple<T> = T | Array<T>;

/**
 * Allows a value to be synchronous or asynchronous.
 * Used for functions that may return a Promise or a direct value.
 */
export type MaybeAsync<T> = T | Promise<T>;

/**
 * Resolves the inner value of a Promise.
 */
export type ResolvedType<T> = T extends Promise<infer Value> ? Value : T;


/* ----------------------- *
 *     Action System      *
 * ----------------------- */

/**
 * Extendable interface for defining custom plugin actions.
 */
export interface GasketActions { }

/**
 * Type representing the keys of registered Gasket actions.
 */
export type ActionId = keyof GasketActions;

/**
 * Defines a handler for a specific action type.
 */
export type ActionHandler<Id extends ActionId> = (
  gasket: Gasket,
  ...args: Parameters<GasketActions[Id]>
) => ReturnType<GasketActions[Id]>;


/* ----------------------- *
 *    Hook System Types   *
 * ----------------------- */

/**
 * Built-in lifecycle hooks supported by Gasket.
 */
export interface HookExecTypes {
  /** Runs during initialization. */
  init(): void;

  /** Runs during configuration and can modify the config. */
  configure(config: GasketConfig): GasketConfig;

  /** Runs once the application is ready. */
  ready(): MaybeAsync<void>;

  /** Runs to prepare the application. */
  prepare(config: GasketConfig): MaybeAsync<GasketConfig | GasketConfigDefinition>;
}

/**
 * Available hook names.
 */
export type HookId = keyof HookExecTypes;

/**
 * Defines execution order for hooks.
 */
export type HookTimings = {
  /** Run this hook first. */
  first?: boolean;

  /** Run this hook last. */
  last?: boolean;

  /** Run this hook before these plugin names. */
  before?: string[];

  /** Run this hook after these plugin names. */
  after?: string[];
};

/**
 * Function signature for hook handler methods.
 */
export type HookHandler<Id extends HookId> = (
  gasket: Gasket,
  ...args: Parameters<HookExecTypes[Id]>
) => MaybeAsync<ReturnType<HookExecTypes[Id]>>;

/**
 * Function signature for applying hooks.
 */
export type ApplyHookHandler<Id extends HookId> = (
  ...args: Parameters<HookExecTypes[Id]>
) => ReturnType<HookExecTypes[Id]>;

/**
 * Hook wrapped with timing configuration.
 */
type HookWithTimings<Id extends HookId> = {
  timing: HookTimings;
  handler: HookHandler<Id>;
};

/**
 * Method signature for invoking a hook.
 */
export type HookInvoke<Id extends HookId = HookId> = (
  gasket: Gasket,
  ...args: Parameters<HookExecTypes[Id]>
) => ReturnType<HookExecTypes[Id]>;


/**
 * Hook subscriber entry used internally to track invocation.
 */
export type HookSubscriber = {
  ordering: HookTimings;
  invoke: HookInvoke;
};

/**
 * Configuration structure for all hook subscribers.
 */
export type HookConfig = {
  subscribers: Record<string, HookSubscriber>;
};

/**
 * A valid hook can either be a simple handler or a hook with timing metadata.
 */
export type Hook<Id extends HookId> = HookWithTimings<Id> | HookHandler<Id>;


/* ----------------------- *
 *    Plugin Definition   *
 * ----------------------- */

/**
 * A Gasket plugin defines hooks, optional actions, and plugin metadata.
 */
export type Plugin = {
  /** Plugin name (required) */
  name: string;

  /** Optional version number */
  version?: string;

  /** Optional description */
  description?: string;

  /** Optional dependency plugin names */
  dependencies?: Array<string>;

  /** Lifecycle hooks this plugin implements */
  hooks: {
    [K in HookId]?: Hook<K>;
  };

  /** Optional actions this plugin can register */
  actions?: {
    [K in ActionId]?: ActionHandler<K>;
  };

  /** Arbitrary plugin-specific metadata */
  metadata?: Record<string, any>;
};

/**
 * Function signature to iterate over plugin names.
 */
export type PluginIterator = (plugin: string) => void;

/**
 * A thunk used for executing a plugin's async hook implementation.
 */
export type PluginThunk<Id extends HookId = HookId> = (
  gasket: Gasket,
  pluginTasks: Record<string, Promise<any>>,
  ...args: Parameters<HookExecTypes[Id]>
) => Promise<ReturnType<HookExecTypes[Id]>>;

/**
 * A sync version of PluginThunk.
 */
export type SyncPluginThunk = (
  gasket: Gasket,
  ...args: any[]
) => any;

type RemainingArgs<T extends (...args: any[]) => any> =
  Parameters<T> extends [any, any, ...infer R] ? R : [];

/**
 * Thunk type for waterfall-style hooks that pass a value between plugins.
 */
export type WaterfallThunk<Id extends HookId> = (
  gasket: Gasket,
  value: Parameters<HookExecTypes[Id]>[1],
  ...args: RemainingArgs<HookExecTypes[Id]>
) => Promise<ReturnType<HookExecTypes[Id]>>;


/* ----------------------------- *
 *   Gasket Engine Definition   *
 * ----------------------------- */

/**
 * Core engine that manages plugin hooks and execution.
 */
export interface GasketEngine {
  /** Available plugin actions */
  actions: GasketActions;

  /**
   * Register new plugins onto the Gasket engine.
   */
  registerPlugins(plugins: Plugin[]): void;

  /** Execute a hook asynchronously */
  exec(gasket: Gasket, hook: string, ...args: any[]): Promise<any[]>;

  /** Execute a hook synchronously */
  execSync(gasket: Gasket, hook: string, ...args: any[]): any[];

  /** Execute a waterfall hook asynchronously */
  execWaterfall(gasket: Gasket, hook: string, value: any, ...args: any[]): Promise<any>;

  /** Execute a waterfall hook synchronously */
  execWaterfallSync(gasket: Gasket, hook: string, value: any, ...args: any[]): any;

  /** Execute a hook and return results keyed by plugin */
  execMap(gasket: Gasket, hook: string, ...args: any[]): Promise<Record<string, any>>;

  /** Execute a hook and return results synchronously, keyed by plugin */
  execMapSync(gasket: Gasket, hook: string, ...args: any[]): Record<string, any>;

  /** Apply a function to each hook handler */
  execApply<Return = void>(
    gasket: Gasket,
    hook: string,
    callback: (plugin: Plugin, handler: (...args: any[]) => any) => Promise<Return>
  ): Promise<Return[]>;

  /** Sync version of execApply */
  execApplySync<Return = void>(
    gasket: Gasket,
    hook: string,
    callback: (plugin: Plugin, handler: (...args: any[]) => any) => Return
  ): Return[];

  /**
   * Register a hook handler manually.
   */
  hook<Id extends HookId>(opts: {
    event: Id;
    pluginName?: string;
    timing?: HookTimings;
    handler: HookHandler<Id>;
  }): void;
}

/**
 * Available execution strategies for hook lifecycles.
 */
export type ExecutionType =
  | 'exec'
  | 'execMap'
  | 'execSync'
  | 'execApply'
  | 'execMapSync'
  | 'execApplySync'
  | 'execWaterfall'
  | 'execWaterfallSync';

/**
 * Map of lifecycle event names to their execution plans.
 */
export type PlansByEvent = Record<string, Partial<Record<ExecutionType, unknown>>>;


/* ----------------------------- *
 *   Gasket Engine Utilities    *
 * ----------------------------- */

/**
 * Create a new GasketEngine instance from plugins.
 */
export function GasketEngine_Constructor(plugins: Plugin[]): GasketEngine;

/**
 * Register new plugins onto the Gasket engine.
 */
export function GasketEngine_RegisterPlugins(plugins: Plugin[]): void;

/**
 * Create and run a cached hook execution plan.
 */
export function GasketEngine_ExecWithCachedPlan<Plan, Result>(options: {
  event: string;
  type: string;
  prepare: (hookConfig: HookConfig) => Plan;
  exec: (plan: Plan) => Result;
}): Result;

/**
 * Register a new hook dynamically at runtime.
 */
export function GasketEngine_Hook<Id extends HookId>(options: {
  event: Id;
  pluginName?: string;
  timing?: HookTimings;
  handler: HookHandler<Id>;
}): void;

/**
 * Execute all hooks for a given event.
 */
export function GasketEngine_Exec(
  gasket: Gasket,
  event: string,
  ...args: any[]
): Promise<any[]>;

/**
 * Synchronous version of exec.
 */
export function GasketEngine_ExecSync(
  gasket: Gasket,
  event: string,
  ...args: any[]
): any[];

/**
 * Arguments tuple for a given hook event.
 */
export type HookArgs<Id extends HookId = HookId> = Parameters<HookExecTypes[Id]>;


/**
 * Execute a hook and return results per plugin.
 */
export function GasketEngine_ExecMap<Id extends HookId>(
  gasket: Gasket,
  event: Id,
  ...args: Parameters<HookExecTypes[Id]>
): Promise<Record<string, Awaited<ReturnType<HookExecTypes[Id]>>>>;

/**
 * Synchronous version of execMap.
 */
export function GasketEngine_ExecMapSync(
  gasket: Gasket,
  event: string,
  ...args: any[]
): Record<string, any>;

/**
 * Execute a waterfall hook chain.
 */
export function GasketEngine_ExecWaterfall<Id extends HookId>(
  gasket: Gasket,
  event: Id,
  initial: Parameters<HookExecTypes[Id]>[1],
  ...args: RemainingArgs<HookExecTypes[Id]>
): Promise<ReturnType<HookExecTypes[Id]>>;

/**
 * Synchronous version of execWaterfall.
 */
export function GasketEngine_ExecWaterfallSync(
  gasket: Gasket,
  event: string,
  initial: any,
  ...args: any[]
): any;

/**
 * Apply a function to each plugin hook.
 */
export function GasketEngine_ExecApply(
  gasket: Gasket,
  event: string,
  applyFn: (plugin: Plugin, handler: (...args: any[]) => any) => any
): Promise<any[]>;

/**
 * Synchronous version of execApply.
 */
export function GasketEngine_ExecApplySync(
  gasket: Gasket,
  event: string,
  applyFn: (plugin: Plugin, handler: (...args: any[]) => any) => any
): any[];


/* ----------------------------- *
 *     Gasket Configuration     *
 * ----------------------------- */

/**
 * Resolved runtime Gasket configuration.
 */
export interface GasketConfig {
  plugins: Plugin[];
  root: string;
  env: string;
  command?: string;
}

/**
 * Pre-normalized Gasket config, allows ESM plugins.
 */
export type PreNormalizedGasketConfig = Omit<GasketConfig, 'plugins'> & {
  plugins: (Plugin | { default: Plugin })[];
};

/**
 * Configuration overrides for specific environments or commands.
 */
export type GasketConfigDefinition = Omit<PreNormalizedGasketConfig, 'root' | 'env' | 'command'> & {
  root?: string;
  env?: string;
  environments?: Record<string, GasketConfigOverrides>;
  commands?: Record<string, GasketConfigOverrides>;
};

type PartialRecursive<T> = T extends object
  ? { [K in keyof T]?: PartialRecursive<T[K]> } | undefined
  : T | undefined;

type ConfigKeysRequiringFullEnvConfig = 'plugins';

type GasketConfigOverrides =
  & PartialRecursive<Omit<GasketConfigDefinition, ConfigKeysRequiringFullEnvConfig>>
  & Partial<Pick<GasketConfigDefinition, ConfigKeysRequiringFullEnvConfig>>;


/* ----------------------------- *
 *         Gasket Core          *
 * ----------------------------- */

/**
 * Main Gasket instance used throughout apps and plugins.
 */
export interface Gasket {
  /** Final config after merging env overrides */
  config: GasketConfig;

  /** Internal engine for lifecycle hook execution */
  engine: GasketEngine;

  /** Used for registering hooks */
  hook: GasketEngine['hook'];

  /** Unique symbol for this instance */
  symbol: symbol;

  /** Resolves when app is fully ready */
  isReady: Promise<void>;

  /** Access plugin actions */
  readonly actions: GasketEngine['actions'];

  /** Trace subtree for this Gasket instance */
  traceBranch(): GasketTrace;

  /** Returns the root Gasket instance */
  traceRoot(): Gasket;

  /** Optional debug hook trace helper */
  traceHookStart?: (pluginName: string, event: string) => void;

  /** Execute a lifecycle event asynchronously */
  exec(event: string, ...args: any[]): Promise<any>;

  /** Execute a lifecycle event synchronously */
  execSync(event: string, ...args: any[]): any[];

  /** Execute a lifecycle event and return final result from waterfall (async) */
  execWaterfall(event: string, input: any, ...args: any[]): Promise<any>;

  /** Execute a lifecycle event and return final result from waterfall (sync) */
  execWaterfallSync(event: string, input: any, ...args: any[]): any;

  [key: string]: any;
}

export interface Tracer {
  /** Stack of trace entries for the current branch */
  traceStack: string[];

  /** Generic trace function used internally */
  trace: (message: string) => void;

  /** Marks the start of a plugin's lifecycle hook */
  traceHookStart(pluginName: string, event: string): void;

  /** Marks the start of a lifecycle execution */
  traceLifecycleStart(type: string, event: string): void;

  /** Marks the end of a lifecycle execution (currently stubbed) */
  traceLifecycleEnd(type: string, event: string): void;

  /** Marks the start of a traced action */
  traceActionStart(name: string): void;

  /** Marks the end of a traced action (currently stubbed) */
  traceActionEnd(name: string): void;
}

/**
 * Gasket instance with debugging trace helper.
 */
export interface GasketTrace {
  /** Unique branch ID */
  branchId: number;

  /** Reference to the lifecycle engine */
  engine: GasketEngine;

  /** Trace output function */
  trace: (msg: string) => void;

  /** Lifecycle hook start tracer */
  traceHookStart: (pluginName: string, event: string) => void;

  /** Returns the root Gasket instance */
  traceRoot(): Gasket;

  /** Returns a new GasketTrace proxy branch */
  traceBranch(): GasketTrace;

  /** Internal tracer helper */
  _tracer: Tracer

  /** Proxy that combines both Gasket and GasketTrace behavior */
  _proxy: Gasket & GasketTrace;
}

export interface GasketTraceConstructor {
  new(parent: Gasket | GasketTrace, newBranchId?: number): GasketTrace;
}


/* ----------------------------- *
 *     Legacy / Compatibility   *
 * ----------------------------- */

/**
 * Legacy interface for request-like shape.
 * @deprecated - Use class from `@gasket/request` instead.
 */
export interface GasketRequest {
  cookies: Record<string, string>;
  headers: Record<string, string>;
  query?: Record<string, string>;
}


/* ----------------------------- *
 *         Factory Function     *
 * ----------------------------- */

/**
 * Factory to create a new Gasket instance with provided config.
 */
export function makeGasket(config: GasketConfigDefinition): Gasket;

export type isolateLifecycle<T> = (
  source: Gasket | GasketTrace,
  name: string,
  fn: HookHandler<T>
) => HookHandler<T>;

export type isolateAction<T> = (source: GasketTrace, name: string, fn: ActionHandler<T>) => ActionHandler<T>

export type interceptActions = (source: GasketTrace, actions: GasketActions) => GasketActions

export type makeTraceBranch = (gasket: Gasket | GasketTrace) => GasketTrace

/* ----------------------- *
 *    Engine Utils Types   *
 * ----------------------- */

/**
 * Lifecycle method names available on the engine.
 * Used for dynamically binding context for destructured methods.
 */
export const lifecycleMethods: string[];

/**
 * Normalize hook to ensure it is in the { handler, timing } shape
 * @template {HookId} Id
 * @param {Hook<Id>} hook - The hook to normalize
 * @returns {object} Normalized hook with handler and optional timing
 */
export function normalizeHook<Id extends HookId>(
  hook: Hook<Id>
): { handler: HookHandler<Id>; timing?: HookTimings };

/**
 * Create a thunk for async plugin execution
 * @template {HookId} Id
 * @param {string} plugin - Name of the plugin
 * @param {HookSubscriber} subscriber - Hook subscriber configuration
 * @param {string} event - Name of the event
 * @param {Function} [traceHookStart] - Optional function to trace hook start
 * @returns {PluginThunk<Id>} Async thunk function for plugin execution
 */
export function createAsyncThunk<Id extends HookId>(
  plugin: string,
  subscriber: HookSubscriber,
  event: string,
  traceHookStart?: (pluginName: string, event: string) => void
): PluginThunk<Id>;

/**
 * Create a thunk for sync plugin execution
 * @param {string} plugin - Name of the plugin
 * @param {HookSubscriber} subscriber - Hook subscriber configuration
 * @param {string} event - Name of the event
 * @param {Function} [traceHookStart] - Optional function to trace hook start
 * @returns {SyncPluginThunk} Sync thunk function for plugin execution
 */
export function createSyncThunk(
  plugin: string,
  subscriber: HookSubscriber,
  event: string,
  traceHookStart?: (pluginName: string, event: string) => void
): SyncPluginThunk;

/**
 * Generate a unique plugin name for dynamically registered hooks.
 * Used when no `pluginName` is provided explicitly.
 * @returns {string} Unique plugin name string
 */
export function getDynamicPluginName(): string;
