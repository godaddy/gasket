const flatten = require('./flatten');
const Resolver = require('./resolver');
const path = require('path');

let dynamicNamingId = 0;

class PluginEngine {
  constructor(config, { resolveFrom } = {}) {
    this.config = config || {};
    this.config.metadata = this.config.metadata || {};
    this.config.metadata = { ...this.config.metadata, plugins: {}, presets: {} };
    this.resolver = new Resolver({ resolveFrom });

    this._hooks = {};
    this._plans = {};

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
   * @returns {*} result
   */
  _resolvePlugins() {
    const { plugins: pluginConfig } = this.config;
    const { presets = [], add = [], remove } = pluginConfig || { presets: ['default'] };
    const pluginsToRemove = new Set(remove || []);

    // TODO: check to see if presets include duplicate plugins
    const presetsFlatenned = flatten(presets);

    // Adding presets module paths into config.metadata
    this._registerPresetsModulePath(presetsFlatenned);

    const presetEntries = presetsFlatenned
      .map(name => this._resolvePresetSafe(name))
      .reduce((acc, plugins) => [...acc, ...plugins], [])
      .map(plugin => [plugin.shortName, plugin.required]);

    // TODO: check to see if addPlugins have duplicates from presetPlugins
    const addEntries = add.map(name => [name, this.resolver.pluginFor(name)]);

    const pluginsResolved = presetEntries
      .concat(addEntries)
      .filter(([pluginName]) => !pluginsToRemove.has(pluginName));

    // Adding plugins module paths into config.metadata
    this._registerPluginsModulePath(pluginsResolved);

    return pluginsResolved
      .reduce((acc, [pluginName, plugin]) => {
        acc[this._extractName(pluginName)] = plugin;
        return acc;
      }, {});
  }

  /**
   * Saves into the gasket config the module path of the presets
   *
   * @private
   * @param {Array} presets Array of presets
   */
  _registerPresetsModulePath(presets) {
    const rootPath = this._rootPath();

    presets.forEach(presetName => {
      const presetFullName = this.resolver.presetFullName(presetName);
      let relativePath = path.relative(rootPath, path.dirname(require.resolve(`${presetFullName}/package.json`)));
      relativePath = `./${relativePath}`;
      this.config.metadata.presets[presetName] = { modulePath: relativePath };
    });
  }

  /**
   * Saves into the gasket config the module path of the plugins
   *
   * @private
   * @param {Array} plugins Array of plugins
   */
  _registerPluginsModulePath(plugins) {
    const rootPath = this._rootPath();

    plugins.forEach(([pluginName]) => {
      var pluginKey, relativePath;

      if (pluginName.indexOf('/') !== -1) {
        relativePath = path.relative(rootPath, pluginName);
        pluginKey = path.basename(pluginName).replace('-plugin', '');
      } else {
        const pluginFullName = this.resolver.pluginFullName(pluginName);
        relativePath = path.relative(rootPath, path.dirname(require.resolve(`${pluginFullName}/package.json`)));
        pluginKey = pluginName;
      }

      this.config.metadata.plugins[pluginKey] = { modulePath: `./${relativePath}` };
    });
  }

  /**
   * Returns the root path of the app
   *
   * @private
   * @returns {Path} root path of the app
   */
  _rootPath() {
    return path.resolve(__dirname).split('/node_modules')[0];
  }

  /**
   * Early versions of @gasket/*-preset could export shortName strings.
   * This method allows for backwards compatibility with that API.
   *
   * TODO: Remove this backward compatibility once the entire
   * gasket ecosystem has updated to `@gasket/default-preset@2.0.0`
   *
   * @private
   * @param {*} name name
   * @returns {*} result
   */
  _resolvePresetSafe(name) {
    return this.resolver.presetFor(name)
      .map(plugin => {
        return typeof plugin === 'string'
          ? this.resolver.pluginInfoFor({ shortName: plugin })
          : plugin;
      });
  }


  /**
   * Registers hooks
   * @private
   */
  _registerHooks() {
    const plugins = this._plugins = this._resolvePlugins();

    Object
      .entries(plugins)
      .forEach(([pluginName, plugin]) => {
        const { dependencies = [], hooks } = plugin;

        dependencies.forEach(dep => {
          if (!(dep in plugins)) {
            throw new Error(`Missing dependency ${dep} of plugin ${pluginName}`);
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
   * Extracts name
   * @private
   * @param {*} item item
   * @returns {*} result
   */
  _extractName(item) {
    if (typeof item === 'string') return item;

    return item.name;
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
    const { first, before, after, last } = timing || {};

    hookConfig.subscribers[pluginName || `dynamic-${dynamicNamingId++}`] = {
      ordering: {
        first: !!first,
        before: before || [],
        after: after || [],
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
      prepare: hookConfig => {
        const subscribers = hookConfig.subscribers;
        const executionPlan = [];
        const pluginThunks = {};
        this._executeInOrder(hookConfig, plugin => {
          pluginThunks[plugin] = (pluginTasks, ...passedArgs) => {
            pluginTasks[plugin] = Promise
              .all(subscribers[plugin].ordering.after.map(dep => pluginTasks[dep]))
              .then(() => subscribers[plugin].callback(...passedArgs));
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
      prepare: hookConfig => {
        const subscribers = hookConfig.subscribers;
        const executionPlan = [];
        this._executeInOrder(hookConfig, plugin => {
          executionPlan.push(subscribers[plugin].callback);
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
      prepare: hookConfig => {
        const subscribers = hookConfig.subscribers;
        const executionPlan = {};
        this._executeInOrder(hookConfig, plugin => {
          executionPlan[plugin] = (pluginTasks, ...passedArgs) => {
            pluginTasks[plugin] = Promise
              .all(subscribers[plugin].ordering.after.map(dep => pluginTasks[dep]))
              .then(() => subscribers[plugin].callback(...passedArgs));
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
      prepare: hookConfig => {
        const subscribers = hookConfig.subscribers;
        const executionPlan = [];
        this._executeInOrder(hookConfig, plugin => {
          executionPlan.push((resultMap, ...passedArgs) => {
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
      prepare: hookConfig => {
        const subscribers = hookConfig.subscribers;

        return (passedValue, ...args) => {
          let result = Promise.resolve(passedValue);

          this._executeInOrder(hookConfig, plugin => {
            result = result.then((nextValue) => {
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
      prepare: hookConfig => {
        const subscribers = hookConfig.subscribers;

        return (passedValue, ...args) => {
          let result = passedValue;

          this._executeInOrder(hookConfig, plugin => {
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
      prepare: hookConfig => {
        const subscribers = hookConfig.subscribers;
        const executionPlan = [];
        const pluginThunks = {};
        this._executeInOrder(hookConfig, plugin => {
          pluginThunks[plugin] = (pluginTasks) => {
            pluginTasks[plugin] = Promise
              .all(subscribers[plugin].ordering.after.map(dep => pluginTasks[dep]))
              .then(() => applyFn(this._plugins[plugin], subscribers[plugin].callback));
            return pluginTasks[plugin];
          };
          executionPlan.push(pluginThunks[plugin]);
        });

        return executionPlan;
      },
      exec: executionPlan => {
        const pluginTasks = {};
        return Promise.all(executionPlan.map(fn => fn(pluginTasks)));
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
      prepare: hookConfig => {
        const subscribers = hookConfig.subscribers;
        const executionPlan = [];
        this._executeInOrder(hookConfig, plugin => {
          executionPlan.push(() => applyFn(this._plugins[plugin], subscribers[plugin].callback));
        });

        return executionPlan;
      },
      exec: executionPlan => {
        return executionPlan.map(fn => fn());
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

      const hook = subscribers[Object.keys(subscribers)[0]].callback;
      const { name: hookName } = hook;

      // Normalize all "before" in terms of "after"
      ordering.before.forEach(follower => {
        if (follower in subscribers) {
          subscribers[follower].ordering.after.push(plugin);
        } else {
          console.warn(`Plugin '${follower}' does not have hook: '${hookName.replace('bound', '').trim()}'`);
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
