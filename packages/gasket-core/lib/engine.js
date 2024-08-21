let dynamicNamingId = 0;

export const lifecycleMethods = new Set([
  'exec', 'execSync',
  'execWaterfall', 'execWaterfallSync',
  'execMap', 'execMapSync',
  'execApply', 'execApplySync'
]);

export class GasketEngine {
  constructor(plugins) {
    if (!plugins || !Array.isArray(plugins) || !plugins.length) {
      throw new Error('An array of plugins is required');
    }

    this._hooks = {};
    this._plans = {};

    this._registerPlugins(plugins);
    this._registerHooks();
    this._registerActions();

    // Allow methods to be called without context (to support destructuring)
    lifecycleMethods.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  _registerPlugins(plugins) {

    // map the plugin name to module contents for easy lookup
    this._pluginMap = plugins
      .reduce((acc, plugin) => {
        if (typeof plugin !== 'object' || Array.isArray(plugin)) {
          throw new Error(`Plugin ${plugin.name} must be an object`);
        }

        const { name, hooks } = plugin;
        if (!name) {
          throw new Error('Plugin must have a name');
        }
        if (!hooks) {
          throw new Error(`Plugin (${name}) must have a hooks`);
        }

        // Add base metadata hook if not present
        if (!plugin.hooks.metadata) {
          plugin.hooks.metadata = async (_, metadata) => metadata;
        }

        acc[name] = plugin;
        return acc;
      }, {});
  }

  /**
   * Registers hooks
   * @private
   */
  _registerHooks() {
    Object
      .entries(this._pluginMap)
      .forEach(([pluginName, plugin]) => {
        const { dependencies = [], hooks } = plugin;

        dependencies
          .forEach(name => {
            if (!(name in this._pluginMap)) {
              throw new Error(`Missing dependency ${name} of plugin '${pluginName}'`);
            }
          });

        Object
          .entries(hooks || {})
          .forEach(([event, hook]) => {
            if (typeof (hook) === 'function') {
              hook = { handler: hook };
            }
            const { handler, timing } = hook;
            this.hook({
              event,
              pluginName,
              timing,
              handler
            });
          });
      });
  }

  _registerActions() {
    this.actions = {};
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
          this.actions[actionName] = actions[actionName];
        });
      }
    });
  }

  /**
   * Injects additional lifecycle hooks at runtime.
   * @param {object} options options object
   * @param {string} options.event The name of the event to hook. This is the
   *    same thing as the property name in the `hooks` of a plugin definition.
   * @param {Function} options.handler The function to call when the event
   *    occurs. The function should take the same form as the `hooks` callbacks
   *    in a plugin definition.
   * @param {object} [options.timing] Ordering constraints for when the hook will
   *    execute. Same as the optional `timing` property in plugin hooks.
   * @param {string}  [options.pluginName] Defaults to an auto-generated name.
   *    Only supply this if you need other hooks to be able to order themselves
   *    relative to this hook via `timing` constraints. Important note:
   *    only one hook per event is allowed per plugin name, so if your plugin is
   *    injecting dynamic hooks, be sure that the names are dynamic enough to
   *    avoid conflicts.
   */
  hook({ event, pluginName, timing, handler }) {
    const hookConfig = this._getHookConfig(event);
    const { first, last, before = [], after = [] } = timing || {};

    hookConfig.subscribers[pluginName || `dynamic-${dynamicNamingId++}`] = {
      ordering: {
        first: !!first,
        before,
        after,
        last: !!last
      },
      invoke: (gasket, ...args) => {
        return handler(gasket, ...args);
      }
    };

    delete this._plans[event];
  }

  /**
   * Enables a plugin to introduce new lifecycle events. When
   * calling `exec`, await the `Promise` it returns to wait for the hooks of other
   * plugins to finish.
   * @param gasket
   * @param {string} event The event to execute
   * @param {...*} args Args for hooks
   * @returns {Promise<Array>} An array of the data returned by the hooks, in
   *    the order executed
   */
  exec(gasket, event, ...args) {
    return this._execWithCachedPlan({
      event,
      type: 'exec',
      prepare: (hookConfig) => {
        const subscribers = hookConfig.subscribers;
        const executionPlan = [];
        const pluginThunks = {};
        this._executeInOrder(hookConfig, plugin => {
          pluginThunks[plugin] = (passedGasket, pluginTasks, ...passedArgs) => {
            pluginTasks[plugin] = Promise
              .all(subscribers[plugin].ordering.after.map(dep => pluginTasks[dep]))
              .then(() => {
                passedGasket.traceHookStart?.(plugin, event);
                return subscribers[plugin].invoke(passedGasket, ...passedArgs);
              });
            return pluginTasks[plugin];
          };
          executionPlan.push(pluginThunks[plugin]);
        });

        return executionPlan;
      },
      exec: executionPlan => {
        const pluginTasks = {};
        return Promise.all(executionPlan.map(fn => fn(gasket, pluginTasks, ...args)));
      }
    });
  }

  /**
   * Like `exec`, only all hooks must execute synchronously.
   * The synchronous result is an Array of the hook return values. Using synchronous
   * methods limits flexibility, so it's encouraged to use async methods whenever
   * possible.
   * @param gasket
   * @param {string} event The event to execute
   * @param {...*} args Args for hooks
   * @returns {Promise<Array>} An array of the data returned by the hooks, in
   *    the order executed
   */
  execSync(gasket, event, ...args) {
    return this._execWithCachedPlan({
      event,
      type: 'execSync',
      prepare: (hookConfig) => {
        const subscribers = hookConfig.subscribers;
        const executionPlan = [];
        this._executeInOrder(hookConfig, plugin => {
          executionPlan.push((passedGasket, ...execArgs) => {
            passedGasket.traceHookStart?.(plugin, event);
            return subscribers[plugin].invoke(passedGasket, ...execArgs);
          });
        });

        return executionPlan;
      },
      exec: executionPlan => {
        return executionPlan.map(fn => fn(gasket, ...args));
      }
    });
  }

  /**
   * Like `exec`, only the Promise result is an
   * object map with each key being the name of the plugin and each value the
   * result from the hook. Only the plugins that hooked the event will have keys
   * present in the map.
   * @param gasket
   * @param {string} event The event to execute
   * @param {...*} args Args for hooks
   * @returns {Promise<object>} An object map with each key being the name of
   *    the plugin and each value the result from the hook
   */
  execMap(gasket, event, ...args) {
    return this._execWithCachedPlan({
      event,
      type: 'execMap',
      prepare: (hookConfig) => {
        const subscribers = hookConfig.subscribers;
        const executionPlan = {};
        this._executeInOrder(hookConfig, plugin => {
          executionPlan[plugin] = (passedGasket, pluginTasks, ...passedArgs) => {
            pluginTasks[plugin] = Promise
              .all(subscribers[plugin].ordering.after.map(dep => pluginTasks[dep]))
              .then(() => {
                passedGasket.traceHookStart?.(plugin, event);
                return subscribers[plugin].invoke(passedGasket, ...passedArgs);
              });
            return pluginTasks[plugin];
          };
        });

        return executionPlan;
      },
      async exec(executionPlan) {
        const pluginTasks = {};
        const resultMap = {};
        await Promise.all(
          Object
            .entries(executionPlan)
            .map(async ([plugin, thunk]) => {
              resultMap[plugin] = await thunk(gasket, pluginTasks, ...args);
            })
        );
        return resultMap;
      }
    });
  }

  /**
   * Like `execMap`, only all hooks must execute synchronously
   * @param gasket
   * @param {string} event The event to execute
   * @param {...*} args Args for hooks
   * @returns {Promise<object>} An object map with each key being the name of
   *    the plugin and each value the result from the hook
   */
  execMapSync(gasket, event, ...args) {
    return this._execWithCachedPlan({
      event,
      type: 'execMapSync',
      prepare: (hookConfig) => {
        const subscribers = hookConfig.subscribers;
        const executionPlan = [];
        this._executeInOrder(hookConfig, plugin => {
          executionPlan.push((passedGasket, resultMap, ...passedArgs) => {
            passedGasket.traceHookStart?.(plugin, event);
            resultMap[plugin] = subscribers[plugin].invoke(passedGasket, ...passedArgs);
          });
        });

        return executionPlan;
      },
      exec(executionPlan) {
        const resultMap = {};
        executionPlan.forEach(thunk => thunk(gasket, resultMap, ...args));
        return resultMap;
      }
    });
  }

  /**
   * Like `exec`, only it allows you to have each
   * hook execute sequentially, with each result being passed as the first argument
   * to the next hook. It's like an asynchronous version of `Array.prototype.reduce`.
   * @param gasket
   * @param {string} event The event to execute
   * @param {any} value Value to pass to initial hook
   * @param {...*} otherArgs Args for hooks
   * @returns {Promise} The result of the final executed hook.
   */
  execWaterfall(gasket, event, value, ...otherArgs) {
    const type = 'execWaterfall';
    return this._execWithCachedPlan({
      event,
      type,
      prepare: (hookConfig) => {
        const subscribers = hookConfig.subscribers;

        return (passedGasket, passedValue, ...args) => {
          let result = Promise.resolve(passedValue);

          this._executeInOrder(hookConfig, plugin => {
            result = result.then((nextValue) => {
              passedGasket.traceHookStart?.(plugin, event);
              return subscribers[plugin].invoke(passedGasket, nextValue, ...args);
            });
          });

          return result;
        };
      },
      exec: (executionPlan) => {
        return executionPlan(gasket, value, ...otherArgs);
      }
    });
  }

  /**
   * Like `execWaterfall`, only each hook must
   * execute synchronously. The final value is returned synchronously from this call.
   * Using synchronous methods limits flexibility, so it's encouraged to use async
   * methods whenever possible.
   * @param gasket
   * @param {string} event The event to execute
   * @param {any} value Value to pass to initial hook
   * @param {...*} otherArgs Args for hooks
   * @returns {Promise} The result of the final executed hook.
   */
  execWaterfallSync(gasket, event, value, ...otherArgs) {
    return this._execWithCachedPlan({
      event,
      type: 'execWaterfallSync',
      prepare: (hookConfig) => {
        const subscribers = hookConfig.subscribers;

        return (passedGasket, passedValue, ...args) => {
          let result = passedValue;

          this._executeInOrder(hookConfig, plugin => {
            passedGasket.traceHookStart?.(plugin, event);
            result = subscribers[plugin].invoke(passedGasket, result, ...args);
          });

          return result;
        };
      },
      exec: executionPlan => {
        return executionPlan(gasket, value, ...otherArgs);
      }
    });
  }

  /**
   * Method execution is ordered like `exec`, but you must invoke the handler
   * yourself with explicit arguments. These arguments can be dynamic based on
   * the plugin itself.
   * @param gasket
   * @param {string} event The event to execute
   * @param {Function} applyFn Function to apply
   * @returns {Promise<Array>} An array of the data returned by the hooks, in
   *    the order executed
   */
  execApply(gasket, event, applyFn) {
    return this._execWithCachedPlan({
      event,
      type: 'execApply',
      prepare: (hookConfig) => {
        const subscribers = hookConfig.subscribers;
        const executionPlan = [];
        const pluginThunks = {};
        this._executeInOrder(hookConfig, plugin => {
          pluginThunks[plugin] = (passedGasket, passedApplyFn, pluginTasks) => {
            const callback = (...args) => subscribers[plugin].invoke(passedGasket, ...args);
            pluginTasks[plugin] = Promise
              .all(subscribers[plugin].ordering.after.map(dep => pluginTasks[dep]))
              .then(() => {
                passedGasket.traceHookStart?.(plugin, event);
                return passedApplyFn(this._pluginMap[plugin], callback);
              });
            return pluginTasks[plugin];
          };
          executionPlan.push(pluginThunks[plugin]);
        });

        return executionPlan;
      },
      exec: executionPlan => {
        const pluginTasks = {};
        return Promise.all(executionPlan.map(fn => fn(gasket, applyFn, pluginTasks)));
      }
    });
  }

  /**
   * Like `execApply`, only all hooks must execute synchronously.
   * @param gasket
   * @param {string} event The event to execute
   * @param {Function} applyFn Function to apply
   * @returns {Promise<Array>} An array of the data returned by the hooks, in
   *    the order executed
   */
  execApplySync(gasket, event, applyFn) {
    return this._execWithCachedPlan({
      event,
      type: 'execApplySync',
      prepare: (hookConfig) => {
        const subscribers = hookConfig.subscribers;
        const executionPlan = [];
        this._executeInOrder(hookConfig, (plugin) => {
          executionPlan.push((passedGasket, passApplyFn) => {
            const callback = (...args) => subscribers[plugin].invoke(passedGasket, ...args);
            passedGasket.traceHookStart?.(plugin, event);
            return passApplyFn(this._pluginMap[plugin], callback);
          });
        });
        return executionPlan;
      },
      exec: executionPlan => {
        return executionPlan.map(fn => fn(gasket, applyFn));
      }
    });
  }

  /**
   * Exec, but with a cache for plans by type
   * @private
   * @param {object} options options
   * @param [options.gasket]
   * @param options.event
   * @param options.type
   * @param options.prepare
   * @param options.exec
   * @returns {*} result
   */
  _execWithCachedPlan({ event, type, prepare, exec }) {
    const hookConfig = this._getHookConfig(event);
    const plansByType = this._plans[event] || (
      this._plans[event] = {}
    );
    const plan = plansByType[type] || (
      plansByType[type] = prepare(hookConfig)
    );

    return exec(plan);
  }

  /**
   * Gets hook config
   * @private
   * @param {*} event event
   * @returns {*} result
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
   * @param {*} hookConfig hook config
   * @param {*} fn fn
   */
  _executeInOrder(hookConfig, fn) {
    this._normalizeOrdering(hookConfig);

    const subscribers = hookConfig.subscribers;
    const allPlugins = new Set(Object.keys(subscribers));
    const executed = new Set();
    const isAccountedFor = dep => !allPlugins.has(dep) || executed.has(dep);

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
   * @param {*} hookConfig hook config
   */
  _normalizeOrdering(hookConfig) {
    const subscribers = hookConfig.subscribers;
    const allPlugins = new Set(Object.keys(subscribers));

    const orderings = [...allPlugins].reduce((accum, plugin) => {
      const ordering = subscribers[plugin].ordering;
      if (ordering.first) {
        accum.firsts.push(plugin);
      } else if (ordering.last) {
        accum.lasts.push(plugin);
      } else {
        accum.middles.push(plugin);
      }

      // Normalize all "before" in terms of "after"
      ordering.before.forEach(follower => {
        if (follower in subscribers) {
          subscribers[follower].ordering.after.push(plugin);
        } // else ignore
      });

      return accum;
    }, {
      firsts: [],
      middles: [],
      lasts: []
    });

    // Normalize firsts/lasts in terms of "after"
    orderings.firsts.forEach(plugin => {
      orderings.middles
        .concat(orderings.lasts)
        .forEach(other => subscribers[other].ordering.after.push(plugin));
    });
    orderings.lasts.forEach(plugin => {
      orderings.firsts
        .concat(orderings.middles)
        .forEach(other => subscribers[plugin].ordering.after.push(other));
    });
  }
}
