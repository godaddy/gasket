const Engine = require('@gasket/plugin-engine');

/**
 * Helper function to easily add plugins to a plugin engine instance
 * so we can test the execution of lifecycle events.
 *
 * @param {Object} config Configuration for the plugin engine.
 * @param {Array} plugins The plugins that need to be added.
 * @returns {PluginEngine} The plugin Engine.
 * @private
 */
exports.lifecycle = function lifecycle(config = {}, ...plugins) {
  plugins = plugins.map(function (hooks, i) {
    if (hooks.hooks) return hooks;

    return {
      name: `test-${i}`,
      hooks
    };
  });

  return new Engine({
    plugins: {
      add: [require('../../index'), 'log', 'nextjs', 'webpack', 'express', ...plugins].filter(Boolean)
    },
    next: {},
    http: {
      port: 8111
    },

    ...config
  });
};
