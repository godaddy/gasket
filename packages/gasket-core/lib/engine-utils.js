let dynamicNamingId = 0;

/**
 * Lifecycle method names available on the engine.
 * Used for dynamically binding context for destructured methods.
 * @type {import('.').lifecycleMethods}
 */
export const lifecycleMethods = [
  'exec', 'execSync',
  'execWaterfall', 'execWaterfallSync',
  'execMap', 'execMapSync',
  'execApply', 'execApplySync'
];

/**
 * Normalize hook to ensure it is in the { handler, timing } shape
 * @type {import('.').normalizeHook}
 */
export function normalizeHook(hook) {
  return typeof hook === 'function' ? { handler: hook } : hook;
}

/**
 * Create a thunk for async plugin execution
 * @type {import('.').createAsyncThunk}
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
 * @type {import('.').createSyncThunk}
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
 * @type {import('.').getDynamicPluginName}
 */
export function getDynamicPluginName() {
  return `dynamic-${dynamicNamingId++}`;
}
