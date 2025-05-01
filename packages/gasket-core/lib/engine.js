/// <reference types="@gasket/plugin-metadata" />

import { normalizeHook, lifecycleMethods, createAsyncThunk, getDynamicPluginName } from './engine-utils.js';

export { lifecycleMethods };

/**
 * The Gasket class is the main entry point for the Gasket API.
 * @type {import('@gasket/core').GasketEngine}
 */
export class GasketEngine {
  /**
   * @type {import('@gasket/core').GasketEngine_Constructor}
   */
  constructor(plugins) {
    this.registerPlugins(plugins);
  }

  /**
   * @type {import('@gasket/core').GasketEngine_RegisterPlugins}
   */
  registerPlugins(plugins) {
    if (!plugins || !Array.isArray(plugins) || !plugins.length) {
      throw new Error('An array of plugins is required');
    }

    /**
     * @private
     * @type {Record<string, import('@gasket/core').HookConfig>}
     */
    this._hooks = {};

    /**
     * @private
     * @type {import('@gasket/core').PlansByEvent}
     */
    this._plans = {};

    this._registerPlugins(plugins);
    this._registerHooks();
    this._registerActions();

    // Allow methods to be called without context (to support destructuring)
    lifecycleMethods.forEach(method => {
      /** @type {any} */
      const self = (this);
      self[method] = self[method].bind(this);
    });
  }

  /**
   * Maps plugin names to their definitions.
   * @private
   * @param {import('@gasket/core').Plugin[]} plugins
   */
  _registerPlugins(plugins) {
    /**
     * Map the plugin name to module contents for easy lookup
     * @type {Record<string, import('@gasket/core').Plugin>}
     * @private
     */
    this._pluginMap = plugins.reduce((acc, plugin) => {
      if (typeof plugin !== 'object' || Array.isArray(plugin)) {
        throw new Error(`Plugin ${plugin.name} must be an object`);
      }

      const { name, hooks } = plugin;

      if (!name) throw new Error('Plugin must have a name');
      if (!hooks) throw new Error(`Plugin (${name}) must have hooks`);

      // Add base metadata hook if not present
      if (!hooks.metadata) {
        hooks.metadata = async (_, metadata) => metadata;
      }

      acc[name] = plugin;
      return acc;
    },
    /** @type {Record<string, import('@gasket/core').Plugin>} */
    ({})
    );
  }

  /**
   * Registers all hooks defined in pluginMap
   * @private
   */
  _registerHooks() {
    Object.entries(this._pluginMap).forEach(([pluginName, plugin]) => {
      const { dependencies = [], hooks } = plugin;

      dependencies.forEach(name => {
        if (!(name in this._pluginMap)) {
          throw new Error(`Missing dependency ${name} of plugin '${pluginName}'`);
        }
      });

      Object.entries(hooks || {}).forEach(([event, rawHook]) => {
        const { handler, timing } = normalizeHook(rawHook);
        this.hook({
          event: /** @type {keyof import('@gasket/core').HookExecTypes} */ (event),
          pluginName,
          timing,
          handler
        });
      });
    });
  }

  /**
   * Registers actions from plugins.
   * @private
   */
  _registerActions() {
    /** @type {Record<string, Function>} */
    this.actions = {};

    /** @type {Record<string, string>} */
    const actionPluginMap = {};

    Object.entries(this._pluginMap).forEach(([pluginName, plugin]) => {
      const { actions } = plugin;
      if (actions) {
        Object.keys(actions).forEach(actionName => {
          if (actionPluginMap[actionName]) {
            // eslint-disable-next-line no-console
            console.error(
              `Action '${actionName}' from '${pluginName}' was registered by '${actionPluginMap[actionName]}'`
            );
            return;
          }
          actionPluginMap[actionName] = plugin.name;

          const key = /** @type {keyof typeof actions} */ (actionName);
          this.actions[actionName] = actions[key];
        });
      }
    });
  }

  /**
   * Injects additional lifecycle hooks at runtime.
   * @type {import('@gasket/core').GasketEngine_Hook}
   */
  hook({ event, pluginName, timing, handler }) {
    const hookConfig = this._getHookConfig(event);
    const { first, last, before = [], after = [] } = timing || {};

    hookConfig.subscribers[pluginName || getDynamicPluginName()] = {
      ordering: {
        first: !!first,
        before,
        after,
        last: !!last
      },
      invoke: (gasket, ...args) => {
        return /** @type {import('@gasket/core').HookInvoke} */ (handler)(gasket, ...args);
      }
    };

    delete this._plans[event];
  }

  /** @type {import('@gasket/core').GasketEngine_Exec} */
  exec(gasket, event, ...args) {
    return this._execWithCachedPlan({
      event,
      type: 'exec',
      prepare: (
        /** @type {import('@gasket/core').HookConfig} */
        hookConfig
      ) => {
        const { subscribers } = hookConfig;
        /** @type {import('@gasket/core').PluginThunk[]} */
        const executionPlan = [];

        this._executeInOrder(
          hookConfig,
          /** @type {import('@gasket/core').PluginIterator} */
          plugin => {
            const subscriber = subscribers[plugin];
            const thunk = createAsyncThunk(plugin, subscriber, event, gasket.traceHookStart);
            executionPlan.push(thunk);
          }
        );

        return executionPlan;
      },
      exec: (
        /** @type {import('@gasket/core').PluginThunk[]} */
        executionPlan
      ) => {
        /** @type {Record<string, Promise<any>>} */
        const pluginTasks = {};
        return Promise.all(
          executionPlan.map(fn =>
          /** @type {(gasket: import('@gasket/core').Gasket, pluginTasks: Record<string, Promise<any>>, ...args: any[]) => Promise<any>} */(fn)(
              gasket,
              pluginTasks,
              ...args
            )
          )
        );

      }
    });
  }

  /** @type {import('@gasket/core').GasketEngine_ExecSync} */
  execSync(gasket, event, ...args) {
    return this._execWithCachedPlan({
      event,
      type: 'execSync',
      prepare: (
        /** @type {import('@gasket/core').HookConfig} */
        hookConfig
      ) => {
        const { subscribers } = hookConfig;
        /** @type {import('@gasket/core').SyncPluginThunk[]} */
        const executionPlan = [];

        this._executeInOrder(hookConfig,
          /** @type {import('@gasket/core').PluginIterator} */
          plugin => {
            executionPlan.push((passedGasket, ...execArgs) => {
              passedGasket.traceHookStart?.(plugin, event);
              const result = subscribers[plugin].invoke(
                passedGasket, .../** @type {import('.').HookArgs<import('.').HookId>} */ (execArgs));
              if (result instanceof Promise) {
                throw new Error(`execSync cannot be used with async hook (${event}) of plugin (${plugin})`);
              }
              return result;
            });
          });

        return executionPlan;
      },
      exec: (
        /** @type {import('@gasket/core').SyncPluginThunk[]} */
        executionPlan
      ) => {
        return executionPlan.map(fn => fn(gasket, ...args));
      }
    });
  }

  /** @type {import('@gasket/core').GasketEngine_ExecMap<Id>} */
  execMap(gasket, event, ...args) {
    return this._execWithCachedPlan({
      event,
      type: 'execMap',
      prepare: (
        /** @type {import('@gasket/core').HookConfig} */
        hookConfig
      ) => {
        const { subscribers } = hookConfig;
        /** @type {Record<string, import('@gasket/core').PluginThunk>} */
        const executionPlan = {};

        this._executeInOrder(hookConfig,
          /** @type {import('@gasket/core').PluginIterator} */
          plugin => {
            const subscriber = subscribers[plugin];
            executionPlan[plugin] = createAsyncThunk(plugin, subscriber, event, gasket.traceHookStart);
          });

        return executionPlan;
      },
      async exec(
        /** @type {Record<string, import('@gasket/core').PluginThunk>} */
        executionPlan
      ) {
        /** @type {Record<string, Promise<any>>} */
        const pluginTasks = {};

        /** @type {Record<string, any>} */
        const resultMap = {};

        await Promise.all(
          Object.entries(executionPlan).map(async ([plugin, thunk]) => {
            resultMap[plugin] = await thunk(gasket, pluginTasks, ...args);
          })
        );
        return resultMap;
      }
    });
  }

  /** @type {import('@gasket/core').GasketEngine_ExecMapSync} */
  execMapSync(gasket, event, ...args) {
    return this._execWithCachedPlan({
      event,
      type: 'execMapSync',
      prepare: (
        /** @type {import('@gasket/core').HookConfig} */
        hookConfig
      ) => {
        const { subscribers } = hookConfig;
        /** @type {import('@gasket/core').SyncPluginThunk[]} */
        const executionPlan = [];
        this._executeInOrder(hookConfig, plugin => {
          executionPlan.push((passedGasket, resultMap, ...passedArgs) => {
            passedGasket.traceHookStart?.(plugin, event);
            resultMap[plugin] = subscribers[plugin].invoke(
              passedGasket,
              .../** @type {import('.').HookArgs<import('.').HookId>} */(passedArgs));
            if (resultMap[plugin] instanceof Promise) {
              throw new Error(`execMapSync cannot be used with async hook (${event}) of plugin (${plugin})`);
            }
          });
        });

        return executionPlan;
      },
      exec: (
        /** @type {import('@gasket/core').SyncPluginThunk[]} */
        executionPlan
      ) => {
        /** @type {Record<string, any>} */
        const resultMap = {};
        executionPlan.forEach(fn => fn(gasket, resultMap, ...args));
        return resultMap;
      }
    });
  }

  /** @type {import('@gasket/core').GasketEngine_ExecWaterfall} */
  execWaterfall(gasket, event, value, ...otherArgs) {
    return this._execWithCachedPlan({
      event,
      type: 'execWaterfall',
      prepare: (
        /** @type {import('@gasket/core').HookConfig} */
        hookConfig
      ) => {
        const { subscribers } = hookConfig;

        /** @type {(gasket: import('@gasket/core').Gasket, value: any, ...args: any[]) => Promise<any>} */
        return (passedGasket, passedValue, ...args) => {
          let result = Promise.resolve(passedValue);

          this._executeInOrder(hookConfig,
            /** @type {import('@gasket/core').PluginIterator} */
            plugin => {
              result = result.then(
                nextValue => {
                  passedGasket.traceHookStart?.(plugin, event);
                  return /** @type {(gasket: import('@gasket/core').Gasket, ...args: any[]) => any} */ (
                    subscribers[plugin].invoke
                  )(passedGasket, nextValue, ...args);
                });
            });
          return result;
        };
      },
      exec: executionPlan => executionPlan(gasket, value, ...otherArgs)
    });
  }

  /** @type {import('@gasket/core').GasketEngine_ExecWaterfallSync} */
  execWaterfallSync(gasket, event, value, ...otherArgs) {
    return this._execWithCachedPlan({
      event,
      type: 'execWaterfallSync',
      prepare: (hookConfig) => {
        const { subscribers } = hookConfig;
        return (passedGasket, passedValue, ...args) => {
          let result = passedValue;

          this._executeInOrder(hookConfig, plugin => {
            passedGasket.traceHookStart?.(plugin, event);

            const invokeArgs = [result, ...args];

            result = subscribers[plugin].invoke(
              passedGasket,
              .../** @type {import('.').HookArgs<import('.').HookId>} */(invokeArgs)
            );

            if (result instanceof Promise) {
              throw new Error(`execWaterfallSync cannot be used with async hook (${event}) of plugin (${plugin})`);
            }
          });

          return result;
        };
      },
      exec: (
        /** @type {(gasket: import('@gasket/core').Gasket, value: any, ...args: any[]) => any} */
        executionPlan
      ) => executionPlan(gasket, value, ...otherArgs)
    });
  }

  /** @type {import('@gasket/core').GasketEngine_ExecApply} */
  execApply(gasket, event, applyFn) {
    return this._execWithCachedPlan({
      event,
      type: 'execApply',
      prepare: (hookConfig) => {
        const { subscribers } = hookConfig;
        /** @type {import('@gasket/core').PluginThunk[]} */
        const executionPlan = [];
        /** @type {Record<string, import('@gasket/core').PluginThunk>} */
        const pluginThunks = {};

        this._executeInOrder(hookConfig,
          /** @type {import('@gasket/core').PluginIterator} */
          plugin => {
            pluginThunks[plugin] = /** @type {(gasket: import('@gasket/core').Gasket, pluginTasks: Record<string, Promise<any>>, applyFn: Function) => Promise<any>} */ (
              (passedGasket, pluginTasks, passedApplyFn) => {
                /** @type {(...args: any[]) => any} */
                const callback = (...args) =>
                /** @type {(gasket: import('@gasket/core').Gasket, ...args: any[]) => any} */(
                    subscribers[plugin].invoke
                  )(passedGasket, ...args);

                pluginTasks[plugin] = Promise
                  .all(subscribers[plugin].ordering.after.map(dep => pluginTasks[dep]))
                  .then(() => {
                    passedGasket.traceHookStart?.(plugin, event);
                    return passedApplyFn(this._pluginMap[plugin], callback);
                  });

                return pluginTasks[plugin];
              }
            );
            executionPlan.push(pluginThunks[plugin]);
          });
        return executionPlan;
      },
      exec: executionPlan => {
        /** @type {Record<string, Promise<any>>} */
        const pluginTasks = {};
        return Promise.all(
          executionPlan.map(fn => fn(gasket, pluginTasks, applyFn))
        );
      }
    });
  }

  /** @type {import('@gasket/core').GasketEngine_ExecApplySync} */
  execApplySync(gasket, event, applyFn) {
    return this._execWithCachedPlan({
      event,
      type: 'execApplySync',
      prepare: (hookConfig) => {
        const { subscribers } = hookConfig;
        /** @type {import('@gasket/core').SyncPluginThunk[]} */
        const executionPlan = [];
        this._executeInOrder(hookConfig, (plugin) => {
          executionPlan.push((passedGasket, passApplyFn) => {
            const callback = (...args) => subscribers[plugin].invoke(
              passedGasket,
              .../** @type {import('.').HookArgs<import('.').HookId>} */(args));
            passedGasket.traceHookStart?.(plugin, event);
            const result = passApplyFn(this._pluginMap[plugin], callback);
            if (result instanceof Promise) {
              throw new Error(`execApplySync cannot be used with async hook (${event}) of plugin (${plugin})`);
            }
            return result;
          });
        });
        return executionPlan;
      },
      exec: executionPlan => executionPlan.map(fn => fn(gasket, applyFn))
    });
  }
  /**
   * Exec, but with a cache for plans by type
   * @private
   * @template Plan
   * @template Result
   * @param {{
   *   event: string,
   *   type: string,
   *   prepare: (hookConfig: import('@gasket/core').HookConfig) => Plan,
   *   exec: (plan: Plan) => Result
   * }} options
   * @returns {Result}
   */
  _execWithCachedPlan({ event, type, prepare, exec }) {
    const hookConfig = this._getHookConfig(event);
    const plansByType = /** @type {Record<string, unknown>} */ (this._plans[event] ||= {});
    const plan = plansByType[type] ||= prepare(hookConfig);
    return exec(/** @type {Plan} */(plan));
  }

  /**
   * @private
   * @param {string} event
   * @returns {import('@gasket/core').HookConfig}
   */
  _getHookConfig(event) {
    if (!(event in this._hooks)) {
      this._hooks[event] = {
        subscribers: {}
      };
    }
    return this._hooks[event];
  }

  /**
   * Executes hooks for plugins in order
   * @private
   * @param {import('@gasket/core').HookConfig} hookConfig
   * @param {Function} fn
   */
  _executeInOrder(hookConfig, fn) {
    this._normalizeOrdering(hookConfig);

    const { subscribers } = hookConfig;
    const allPlugins = new Set(Object.keys(subscribers));
    const executed = new Set();
    const isAccountedFor = (
      /** @type {string} */
      dep
    ) => !allPlugins.has(dep) || executed.has(dep);

    const remaining = new Set(allPlugins);
    while (remaining.size) {
      const canRun = [...remaining].filter(plugin =>
        subscribers[plugin].ordering.after.every(isAccountedFor));
      if (!canRun.length) {
        const badPlugins = [...remaining].join(', ');
        throw new Error(`Impossible ordering constraints for the following plugins: ${badPlugins}`);
      }

      canRun.forEach(plugin => {
        fn(plugin);
        executed.add(plugin);
        remaining.delete(plugin);
      });
    }
  }

  /**
   * Normalizes ordering
   * @private
   * @param {import('@gasket/core').HookConfig} hookConfig
   */
  _normalizeOrdering(hookConfig) {
    const { subscribers } = hookConfig;
    const allPlugins = new Set(Object.keys(subscribers));

    const orderings = [...allPlugins].reduce((accum, plugin) => {
      const ordering = subscribers[plugin].ordering;
      if (ordering.first) accum.firsts.push(plugin);
      else if (ordering.last) accum.lasts.push(plugin);
      else accum.middles.push(plugin);

      // Normalize all "before" in terms of "after"
      ordering.before.forEach(follower => {
        if (follower in subscribers) {
          subscribers[follower].ordering.after.push(plugin);
        }
      });

      return accum;
    }, {
      firsts: [],
      middles: [],
      lasts: []
    });

    // Normalize firsts/lasts in terms of "after"
    orderings.firsts.forEach(plugin => {
      orderings.middles.concat(orderings.lasts).forEach(other =>
        subscribers[other].ordering.after.push(plugin));
    });
    orderings.lasts.forEach(plugin => {
      orderings.firsts.concat(orderings.middles).forEach(other =>
        subscribers[plugin].ordering.after.push(other));
    });
  }
}
