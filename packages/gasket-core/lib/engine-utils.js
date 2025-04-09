/// <reference types="@gasket/plugin-metadata" />

let dynamicNamingId = 0;

/**
 * Lifecycle method names available on the engine.
 * Used for dynamically binding context for destructured methods.
 * @type {string[]}
 */
export const lifecycleMethods = [
  'exec', 'execSync',
  'execWaterfall', 'execWaterfallSync',
  'execMap', 'execMapSync',
  'execApply', 'execApplySync'
];

/**
 * Normalize hook to ensure it is in the { handler, timing } shape
 * @param {import('@gasket/core').Hook<any>} hook
 * @returns {{ handler: import('@gasket/core').HookHandler<any>, timing?: import('@gasket/core').HookTimings }}
 */
export function normalizeHook(hook) {
  return typeof hook === 'function' ? { handler: hook } : hook;
}

/**
 * Create a thunk for async plugin execution
 * @param {string} plugin
 * @param {import('@gasket/core').HookSubscriber} subscriber
 * @param {string} event
 * @param {Function | undefined} traceHookStart
 * @returns {import('@gasket/core').PluginThunk}
 */
export function createAsyncThunk(plugin, subscriber, event, traceHookStart) {
  return (gasket, pluginTasks, ...args) => {
    pluginTasks[plugin] = Promise
      .all(subscriber.ordering.after.map(dep => pluginTasks[dep]))
      .then(() => {
        traceHookStart?.(plugin, event);
        return subscriber.invoke(gasket, ...args);
      });

    return pluginTasks[plugin];
  };
}

/**
 * Create a thunk for sync plugin execution
 * @param {string} plugin
 * @param {import('@gasket/core').HookSubscriber} subscriber
 * @param {string} event
 * @param {Function | undefined} traceHookStart
 * @returns {import('@gasket/core').SyncPluginThunk}
 */
export function createSyncThunk(plugin, subscriber, event, traceHookStart) {
  return (gasket, ...args) => {
    traceHookStart?.(plugin, event);
    return /** @type {(gasket: import('@gasket/core').Gasket, ...args: any[]) => any} */ (
      subscriber.invoke
    )(gasket, ...args);
  };
}

/**
 * Generate a unique plugin name for dynamically registered hooks.
 * Used when no `pluginName` is provided explicitly.
 * @returns {string}
 */
export function getDynamicPluginName() {
  return `dynamic-${dynamicNamingId++}`;
}
