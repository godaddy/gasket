import debugPkg from 'debug';

const debug = debugPkg('gasket:engine');
const reSync = /sync$/i;
const icon = (type) => reSync.test(type) ? '◆' : '◇';

let dynamicNamingId = 0;

const lifecycleMethods = [
  'exec', 'execSync',
  'execWaterfall', 'execWaterfallSync',
  'execMap', 'execMapSync',
  'execApply', 'execApplySync'
];

class GasketNucleus {
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
      invoke: (tracer, ...args) => {
        return handler(tracer, ...args);
      }
    };

    delete this._plans[event];
  }

  /**
   * Enables a plugin to introduce new lifecycle events. When
   * calling `exec`, await the `Promise` it returns to wait for the hooks of other
   * plugins to finish.
   * @param tracer
   * @param {string} event The event to execute
   * @param {...*} args Args for hooks
   * @returns {Promise<Array>} An array of the data returned by the hooks, in
   *    the order executed
   */
  exec(tracer, event, ...args) {
    return this._execWithCachedPlan({
      tracer,
      event,
      type: 'exec',
      prepare: (hookConfig) => {
        const subscribers = hookConfig.subscribers;
        const executionPlan = [];
        const pluginThunks = {};
        this._executeInOrder(hookConfig, plugin => {
          pluginThunks[plugin] = (passedTracer, pluginTasks, ...passedArgs) => {
            pluginTasks[plugin] = Promise
              .all(subscribers[plugin].ordering.after.map(dep => pluginTasks[dep]))
              .then(() => {
                passedTracer.trace.startHook(plugin, event);
                return subscribers[plugin].invoke(passedTracer, ...passedArgs);
              });
            return pluginTasks[plugin];
          };
          executionPlan.push(pluginThunks[plugin]);
        });

        return executionPlan;
      },
      exec: executionPlan => {
        const pluginTasks = {};
        return Promise.all(executionPlan.map(fn => fn(tracer, pluginTasks, ...args)));
      }
    });
  }

  /**
   * Like `exec`, only all hooks must execute synchronously.
   * The synchronous result is an Array of the hook return values. Using synchronous
   * methods limits flexibility, so it's encouraged to use async methods whenever
   * possible.
   * @param tracer
   * @param {string} event The event to execute
   * @param {...*} args Args for hooks
   * @returns {Promise<Array>} An array of the data returned by the hooks, in
   *    the order executed
   */
  execSync(tracer, event, ...args) {
    return this._execWithCachedPlan({
      tracer,
      event,
      type: 'execSync',
      prepare: (hookConfig) => {
        const subscribers = hookConfig.subscribers;
        const executionPlan = [];
        this._executeInOrder(hookConfig, plugin => {
          executionPlan.push((passedTracer, ...execArgs) => {
            passedTracer.trace.startHook(plugin, event);
            return subscribers[plugin].invoke(passedTracer, ...execArgs);
          });
        });

        return executionPlan;
      },
      exec: executionPlan => {
        return executionPlan.map(fn => fn(tracer, ...args));
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
   * @returns {Promise<object>} An object map with each key being the name of
   *    the plugin and each value the result from the hook
   */
  execMap(tracer, event, ...args) {
    return this._execWithCachedPlan({
      tracer,
      event,
      type: 'execMap',
      prepare: (hookConfig) => {
        const subscribers = hookConfig.subscribers;
        const executionPlan = {};
        this._executeInOrder(hookConfig, plugin => {
          executionPlan[plugin] = (passedTracer, pluginTasks, ...passedArgs) => {
            pluginTasks[plugin] = Promise
              .all(subscribers[plugin].ordering.after.map(dep => pluginTasks[dep]))
              .then(() => {
                passedTracer.trace.startHook(plugin, event);
                return subscribers[plugin].invoke(passedTracer, ...passedArgs);
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
              resultMap[plugin] = await thunk(tracer, pluginTasks, ...args);
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
   * @returns {Promise<object>} An object map with each key being the name of
   *    the plugin and each value the result from the hook
   */
  execMapSync(tracer, event, ...args) {
    return this._execWithCachedPlan({
      tracer,
      event,
      type: 'execMapSync',
      prepare: (hookConfig) => {
        const subscribers = hookConfig.subscribers;
        const executionPlan = [];
        this._executeInOrder(hookConfig, plugin => {
          executionPlan.push((passedTracer, resultMap, ...passedArgs) => {
            passedTracer.trace.startHook(plugin, event);
            resultMap[plugin] = subscribers[plugin].invoke(passedTracer, ...passedArgs);
          });
        });

        return executionPlan;
      },
      exec(executionPlan) {
        const resultMap = {};
        executionPlan.forEach(thunk => thunk(tracer, resultMap, ...args));
        return resultMap;
      }
    });
  }

  /**
   * Like `exec`, only it allows you to have each
   * hook execute sequentially, with each result being passed as the first argument
   * to the next hook. It's like an asynchronous version of `Array.prototype.reduce`.
   * @param tracer
   * @param {string} event The event to execute
   * @param {any} value Value to pass to initial hook
   * @param {...*} otherArgs Args for hooks
   * @returns {Promise} The result of the final executed hook.
   */
  execWaterfall(tracer, event, value, ...otherArgs) {
    const type = 'execWaterfall';
    return this._execWithCachedPlan({
      tracer,
      event,
      type,
      prepare: (hookConfig) => {
        const subscribers = hookConfig.subscribers;

        return (passedTracer, passedValue, ...args) => {
          let result = Promise.resolve(passedValue);

          this._executeInOrder(hookConfig, plugin => {
            result = result.then((nextValue) => {
              passedTracer.trace.startHook(plugin, event);
              return subscribers[plugin].invoke(passedTracer, nextValue, ...args);
            });
          });

          return result;
        };
      },
      exec: (executionPlan) => {
        return executionPlan(tracer, value, ...otherArgs);
      }
    });
  }

  /**
   * Like `execWaterfall`, only each hook must
   * execute synchronously. The final value is returned synchronously from this call.
   * Using synchronous methods limits flexibility, so it's encouraged to use async
   * methods whenever possible.
   * @param tracer
   * @param {string} event The event to execute
   * @param {any} value Value to pass to initial hook
   * @param {...*} otherArgs Args for hooks
   * @returns {Promise} The result of the final executed hook.
   */
  execWaterfallSync(tracer, event, value, ...otherArgs) {
    return this._execWithCachedPlan({
      tracer,
      event,
      type: 'execWaterfallSync',
      prepare: (hookConfig) => {
        const subscribers = hookConfig.subscribers;

        return (passedTracer, passedValue, ...args) => {
          let result = passedValue;

          this._executeInOrder(hookConfig, plugin => {
            passedTracer.trace.startHook(plugin, event);
            result = subscribers[plugin].invoke(tracer, result, ...args);
          });

          return result;
        };
      },
      exec: executionPlan => {
        return executionPlan(tracer, value, ...otherArgs);
      }
    });
  }

  /**
   * Method execution is ordered like `exec`, but you must invoke the handler
   * yourself with explicit arguments. These arguments can be dynamic based on
   * the plugin itself.
   * @param {string} event The event to execute
   * @param {Function} applyFn Function to apply
   * @returns {Promise<Array>} An array of the data returned by the hooks, in
   *    the order executed
   */
  execApply(tracer, event, applyFn) {
    return this._execWithCachedPlan({
      tracer,
      event,
      type: 'execApply',
      prepare: (hookConfig) => {
        const subscribers = hookConfig.subscribers;
        const executionPlan = [];
        const pluginThunks = {};
        this._executeInOrder(hookConfig, plugin => {
          pluginThunks[plugin] = (passedTracer, passedApplyFn, pluginTasks) => {
            const callback = (...args) => subscribers[plugin].invoke(passedTracer, ...args);
            pluginTasks[plugin] = Promise
              .all(subscribers[plugin].ordering.after.map(dep => pluginTasks[dep]))
              .then(() => {
                passedTracer.trace.startHook(plugin, event);
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
        return Promise.all(executionPlan.map(fn => fn(tracer, applyFn, pluginTasks)));
      }
    });
  }

  /**
   * Like `execApply`, only all hooks must execute synchronously.
   * @param {string} event The event to execute
   * @param {Function} applyFn Function to apply
   * @returns {Promise<Array>} An array of the data returned by the hooks, in
   *    the order executed
   */
  execApplySync(tracer, event, applyFn) {
    return this._execWithCachedPlan({
      tracer,
      event,
      type: 'execApplySync',
      prepare: (hookConfig) => {
        const subscribers = hookConfig.subscribers;
        const executionPlan = [];
        this._executeInOrder(hookConfig, (plugin) => {
          executionPlan.push((passedTracer, passApplyFn) => {
            const callback = (...args) => subscribers[plugin].invoke(passedTracer, ...args);
            passedTracer.trace.startHook(plugin, event);
            return passApplyFn(this._pluginMap[plugin], callback);
          });
        });
        return executionPlan;
      },
      exec: executionPlan => {
        return executionPlan.map(fn => fn(tracer, applyFn));
      }
    });
  }

  /**
   * Exec, but with a cache for plans by type
   * @private
   * @param {object} options options
   * @param [options.tracer]
   * @param options.event
   * @param options.type
   * @param options.prepare
   * @param options.exec
   * @returns {*} result
   */
  _execWithCachedPlan({ tracer, event, type, prepare, exec }) {
    const hookConfig = this._getHookConfig(event);
    const plansByType = this._plans[event] || (
      this._plans[event] = {}
    );
    const plan = plansByType[type] || (
      plansByType[type] = prepare(hookConfig)
    );

    tracer.trace.startLifecycle(type, event);
    const result = exec(plan);
    if (typeof result?.finally === 'function') {
      return result.finally(() => {
        tracer.trace.endLifecycle(type, event);
      });
    }

    tracer.trace.endLifecycle(type, event);
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

export class GasketEngine {
  constructor(plugins) {
    this._nextTracerId = 0;
    this._nucleus = new GasketNucleus(plugins);

    // Allow methods to be called without context (to support destructuring)
    lifecycleMethods.forEach(method => {
      this[method] = this[method].bind(this);
    });

    this.hook = this._nucleus.hook.bind(this._nucleus);
  }

  withDriver() {
    return makeDriverProxy(this, this._nextTracerId++);
  }

  get actions() {
    return this.withDriver().actions;
  }

  exec(event, ...args) {
    return this.withDriver().exec(event, ...args);
  }

  execSync(event, ...args) {
    return this.withDriver().execSync(event, ...args);
  }

  execMap(event, ...args) {
    return this.withDriver().execMap(event, ...args);
  }

  execMapSync(event, ...args) {
    return this.withDriver().execMapSync(event, ...args);
  }

  execWaterfall(event, value, ...otherArgs) {
    return this.withDriver().execWaterfall(event, value, ...otherArgs);
  }

  execWaterfallSync(event, value, ...otherArgs) {
    return this.withDriver().execWaterfallSync(event, value, ...otherArgs);
  }

  execApply(event, applyFn) {
    return this.withDriver().execApply(event, applyFn);
  }

  execApplySync(event, applyFn) {
    return this.withDriver().execApplySync(event, applyFn);
  }
}

export class GasketEngineDriver {
  constructor(engine, id) {

    this.traceStack = [];
    this.trace = {
      startHook: (pluginName, event) => {
        debug(`[${id}]${'  '.repeat(this.traceStack.length)}↪ ${pluginName}:${event}`);
      },
      startLifecycle: (type, event) => {
        const name = `${type}(${event})`;
        if (this.traceStack.includes(name)) {
          throw new Error(`Recursive lifecycle detected: ${[...this.traceStack, name].join(' -> ')}`);
        }
        this.traceStack.push(name);

        const ico = icon(type);
        debug(`[${id}]${'  '.repeat(this.traceStack.length)}${ico} ${name}`);
      },
      endLifecycle: (type, event) => {
        const name = `${type}(${event})`;
        this.traceStack.splice(this.traceStack.lastIndexOf(name), 1);
      },
      startAction: (name) => {
        this.traceStack.push(name);
        debug(`[${id}]${'  '.repeat(this.traceStack.length)}⚡︎ ${name}`);
      },
      endAction: (name) => {
        this.traceStack.splice(this.traceStack.lastIndexOf(name), 1);
      }
    };

    lifecycleMethods.forEach(name => {
      this[name] = engine._nucleus[name].bind(engine._nucleus, this);
    });

    this.hook = engine.hook;

    this.actions = Object.entries(engine._nucleus.actions)
      .reduce((acc, [name, fn]) => {
        acc[name] = (...args) => {
          this.trace.startAction(name);
          const result = fn(this, ...args);
          if (typeof result?.finally === 'function') {
            return result.finally(() => {
              this.trace.endAction(name);
            });
          }
          this.trace.endAction(name);
          return result;
        };
        return acc;
      }, {});
  }
}

/**
 *
 * @param engine
 * @param id
 */
function makeDriverProxy(engine, id) {
  const driver = new GasketEngineDriver(engine, id);
  const proxy = new Proxy(driver, {
    get(target, prop) {
      if (prop in target) {
        return target[prop];
      }
      return engine[prop];
    }
  });
  return proxy;
}
