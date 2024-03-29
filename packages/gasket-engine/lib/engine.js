const debug = require('debug')('gasket:engine');
const { Loader, pluginIdentifier } = require('@gasket/resolve');

let dynamicNamingId = 0;
const isModulePath = /^[/.]|^[a-zA-Z]:\\/;

class PluginEngine {
  constructor(config, { resolveFrom } = {}) {
    this.config = config || {};
    this.loader = new Loader({ resolveFrom });

    this._hooks = {};
    this._plans = {};
    this._traceDepth = 0;

    this._registerPlugins();
    this._registerHooks();

    // Allow methods to be called without context (to support destructuring)
    [
      'exec', 'execWaterfall', 'execMap', 'execApply',
      'execSync', 'execWaterfallSync', 'execMapSync', 'execApplySync'
    ].forEach(method => { this[method] = this[method].bind(this); });
  }

  /**
   * Resolves plugins
   * @private
   */
  _registerPlugins() {
    const { plugins } = this.loader.loadConfigured(this.config.plugins);

    // map the plugin name to module content
    // if loaded from a file path, prefer module.name
    // otherwise, prefer package name and normalize to long name form
    this._plugins = plugins
      .reduce((acc, pluginInfo) => {
        let keyName;
        if (isModulePath.test(pluginInfo.name)) {
          keyName = pluginInfo.module.name ? pluginIdentifier(pluginInfo.module.name).longName : pluginInfo.name;
        } else {
          keyName = pluginIdentifier(pluginInfo.name || pluginInfo.module.name).longName;
        }
        acc[keyName] = pluginInfo.module;
        return acc;
      }, {});
  }

  /**
   * Registers hooks
   * @private
   */
  _registerHooks() {
    Object
      .entries(this._plugins)
      .forEach(([pluginName, plugin]) => {
        const { dependencies = [], hooks } = plugin;

        dependencies
          .forEach(rawName => {
            const name = pluginIdentifier(rawName).longName;
            if (!(name in this._plugins)) {
              throw new Error(`Missing dependency ${rawName} of plugin '${pluginName}'`);
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

  /**
   * Injects additional lifecycle hooks at runtime.
   * @param {Object} options options object
   * @param {string} options.event The name of the event to hook. This is the
   *    same thing as the property name in the `hooks` of a plugin definition.
   * @param {function} options.handler The function to call when the event
   *    occurs. The function should take the same form as the `hooks` callbacks
   *    in a plugin definition.
   * @param {Object} [options.timing] Ordering constraints for when the hook will
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
    const { first, last, before, after } = timing || {};

    // normalize to long name form
    const beforeNorm = (before || []).map(rawName => pluginIdentifier(rawName).longName);
    const afterNorm = (after || []).map(rawName => pluginIdentifier(rawName).longName);

    hookConfig.subscribers[pluginName || `dynamic-${dynamicNamingId++}`] = {
      ordering: {
        first: !!first,
        before: beforeNorm,
        after: afterNorm,
        last: !!last
      },
      callback: handler.bind(null, this)
    };

    delete this._plans[event];
  }

  /**
   * Enables a plugin to introduce new lifecycle events. When
   * calling `exec`, await the `Promise` it returns to wait for the hooks of other
   * plugins to finish.
   *
   * @param {string} event The event to execute
   * @param {...*} args Args for hooks
   * @returns {Promise<Array>} An array of the data returned by the hooks, in
   *    the order executed
   */
  exec(event, ...args) {
    return this._execWithCachedPlan({
      event,
      type: 'exec',
      prepare: (hookConfig, trace) => {
        const subscribers = hookConfig.subscribers;
        const executionPlan = [];
        const pluginThunks = {};
        this._executeInOrder(hookConfig, plugin => {
          pluginThunks[plugin] = (pluginTasks, ...passedArgs) => {
            pluginTasks[plugin] = Promise
              .all(subscribers[plugin].ordering.after.map(dep => pluginTasks[dep]))
              .then(() => {
                trace(plugin);
                return subscribers[plugin].callback(...passedArgs);
              });
            return pluginTasks[plugin];
          };
          executionPlan.push(pluginThunks[plugin]);
        });

        return executionPlan;
      },
      exec: executionPlan => {
        const pluginTasks = {};
        return Promise.all(executionPlan.map(fn => fn(pluginTasks, ...args)));
      }
    });
  }

  /**
   * Like `exec`, only all hooks must execute synchronously.
   * The synchronous result is an Array of the hook return values. Using synchronous
   * methods limits flexibility, so it's encouraged to use async methods whenever
   * possible.
   * @param {string} event The event to execute
   * @param {...*} args Args for hooks
   * @returns {Promise<Array>} An array of the data returned by the hooks, in
   *    the order executed
   */
  execSync(event, ...args) {
    return this._execWithCachedPlan({
      event,
      type: 'execSync',
      prepare: (hookConfig, trace) => {
        const subscribers = hookConfig.subscribers;
        const executionPlan = [];
        this._executeInOrder(hookConfig, plugin => {
          executionPlan.push((...execArgs) => {
            trace(plugin);
            return subscribers[plugin].callback(...execArgs);
          });
        });

        return executionPlan;
      },
      exec: executionPlan => {
        return executionPlan.map(fn => fn(...args));
      }
    });
  }

  /**
   * Like `exec`, only the Promise result is an
   * object map with each key being the name of the plugin and each value the
   * result from the hook. Only the plugins that hooked the event will have keys
   * present in the map.
   * @param {string} event The event to execute
   * @param {...*} args Args for hooks
   * @returns {Promise<Object>} An object map with each key being the name of
   *    the plugin and each value the result from the hook
   */
  execMap(event, ...args) {
    return this._execWithCachedPlan({
      event,
      type: 'execMap',
      prepare: (hookConfig, trace) => {
        const subscribers = hookConfig.subscribers;
        const executionPlan = {};
        this._executeInOrder(hookConfig, plugin => {
          executionPlan[plugin] = (pluginTasks, ...passedArgs) => {
            pluginTasks[plugin] = Promise
              .all(subscribers[plugin].ordering.after.map(dep => pluginTasks[dep]))
              .then(() => {
                trace(plugin);
                return subscribers[plugin].callback(...passedArgs);
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
              resultMap[plugin] = await thunk(pluginTasks, ...args);
            })
        );
        return resultMap;
      }
    });
  }

  /**
   * Like `execMap`, only all hooks must execute synchronously
   * @param {string} event The event to execute
   * @param {...*} args Args for hooks
   * @returns {Promise<Object>} An object map with each key being the name of
   *    the plugin and each value the result from the hook
   */
  execMapSync(event, ...args) {
    return this._execWithCachedPlan({
      event,
      type: 'execMapSync',
      prepare: (hookConfig, trace) => {
        const subscribers = hookConfig.subscribers;
        const executionPlan = [];
        this._executeInOrder(hookConfig, plugin => {
          executionPlan.push((resultMap, ...passedArgs) => {
            trace(plugin);
            resultMap[plugin] = subscribers[plugin].callback(...passedArgs);
          });
        });

        return executionPlan;
      },
      exec(executionPlan) {
        const resultMap = {};
        executionPlan.forEach(thunk => thunk(resultMap, ...args));
        return resultMap;
      }
    });
  }

  /**
   * Like `exec`, only it allows you to have each
   * hook execute sequentially, with each result being passed as the first argument
   * to the next hook. It's like an asynchronous version of `Array.prototype.reduce`.
   * @param {string} event The event to execute
   * @param {value} value Value to pass to initial hook
   * @param {...*} args Args for hooks
   * @returns {Promise} The result of the final executed hook.
   */
  execWaterfall(event, value, ...otherArgs) {
    return this._execWithCachedPlan({
      event,
      type: 'execWaterfall',
      prepare: (hookConfig, trace) => {
        const subscribers = hookConfig.subscribers;

        return (passedValue, ...args) => {
          let result = Promise.resolve(passedValue);

          this._executeInOrder(hookConfig, plugin => {
            result = result.then((nextValue) => {
              trace(plugin);
              return subscribers[plugin].callback(nextValue, ...args);
            });
          });

          return result;
        };
      },
      exec: executionPlan => {
        return executionPlan(value, ...otherArgs);
      }
    });
  }

  /**
   * Like `execWaterfall`, only each hook must
   * execute synchronously. The final value is returned synchronously from this call.
   * Using synchronous methods limits flexibility, so it's encouraged to use async
   * methods whenever possible.
   * @param {string} event The event to execute
   * @param {value} value Value to pass to initial hook
   * @param {...*} args Args for hooks
   * @returns {Promise} The result of the final executed hook.
   */
  execWaterfallSync(event, value, ...otherArgs) {
    return this._execWithCachedPlan({
      event,
      type: 'execWaterfallSync',
      prepare: (hookConfig, trace) => {
        const subscribers = hookConfig.subscribers;

        return (passedValue, ...args) => {
          let result = passedValue;

          this._executeInOrder(hookConfig, plugin => {
            trace(plugin);
            result = subscribers[plugin].callback(result, ...args);
          });

          return result;
        };
      },
      exec: executionPlan => {
        return executionPlan(value, ...otherArgs);
      }
    });
  }

  /**
   * Method execution is ordered like `exec`, but you must invoke the handler
   * yourself with explicit arguments. These arguments can be dynamic based on
   * the plugin itself.
   * @param {string} event The event to execute
   * @param {function} applyFn Function to apply
   * @param {...*} args Args for hooks
   * @returns {Promise<Array>} An array of the data returned by the hooks, in
   *    the order executed
   */
  execApply(event, applyFn) {
    return this._execWithCachedPlan({
      event,
      type: 'execApply',
      prepare: (hookConfig, trace) => {
        const subscribers = hookConfig.subscribers;
        const executionPlan = [];
        const pluginThunks = {};
        this._executeInOrder(hookConfig, plugin => {
          pluginThunks[plugin] = (fn, pluginTasks) => {
            pluginTasks[plugin] = Promise
              .all(subscribers[plugin].ordering.after.map(dep => pluginTasks[dep]))
              .then(() => {
                trace(plugin);
                return fn(this._plugins[plugin], subscribers[plugin].callback);
              });
            return pluginTasks[plugin];
          };
          executionPlan.push(pluginThunks[plugin]);
        });

        return executionPlan;
      },
      exec: executionPlan => {
        const pluginTasks = {};
        return Promise.all(executionPlan.map(fn => fn(applyFn, pluginTasks)));
      }
    });
  }

  /**
   * Like `execApply`, only all hooks must execute synchronously.
   * @param {string} event The event to execute
   * @param {function} applyFn Function to apply
   * @param {...*} args Args for hooks
   * @returns {Promise<Array>} An array of the data returned by the hooks, in
   *    the order executed
   */
  execApplySync(event, applyFn) {
    return this._execWithCachedPlan({
      event,
      type: 'execApplySync',
      prepare: (hookConfig, trace) => {
        const subscribers = hookConfig.subscribers;
        const executionPlan = [];
        this._executeInOrder(hookConfig, plugin => {
          executionPlan.push(fn => {
            trace(plugin);
            return fn(this._plugins[plugin], subscribers[plugin].callback);
          });
        });
        return executionPlan;
      },
      exec: executionPlan => {
        return executionPlan.map(fn => fn(applyFn));
      }
    });
  }

  /**
   * Exec, but with a cache for plans by type
   * @private
   * @param {Object} options options
   * @returns {*} result
   */
  _execWithCachedPlan({ event, type, prepare, exec }) {
    debug(`${'  '.repeat(this._traceDepth++)}${type} ${event}`);
    const traceDepth = this._traceDepth;
    const trace = plugin => debug(`${'  '.repeat(traceDepth)}${plugin}:${event}`);

    const hookConfig = this._getHookConfig(event);
    const plansByType = this._plans[event] || (
      this._plans[event] = {}
    );
    const plan = plansByType[type] || (
      plansByType[type] = prepare(hookConfig, trace)
    );
    const result = exec(plan);
    if (typeof result?.finally === 'function') {
      return result.finally(() => this._traceDepth--);
    }

    this._traceDepth--;
    return result;
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

module.exports = PluginEngine;
