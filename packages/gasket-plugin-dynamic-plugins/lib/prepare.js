/* eslint-disable no-sync */
import * as path from 'path';
import colors from 'chalk';

const dedupeMsg = colors.gray('      deduped');

export default {
  timing: {
    before: ['@gasket/plugin-command']
  },
  /** @type {import('@gasket/core').HookHandler<'prepare'>} */
  handler: async function prepare(gasket, config) {
    const dynamicPlugins = (config.dynamicPlugins ?? []).filter(Boolean);

    if (!dynamicPlugins.length) return config;

    const imported = await Promise.all(dynamicPlugins.map(pluginName => {
      if (pluginName.startsWith('.')) {
        const absolutePath = path.resolve(gasket.config.root, pluginName);
        return import(absolutePath).then(mod => mod.default);
      }
      return import(pluginName).then(mod => mod.default);
    }));

    imported.forEach(mod => {
      config.plugins.push(mod);
    });

    gasket.engine.registerPlugins(config.plugins);

    /** @type {import('@gasket/core').GasketTrace} */
    const tracer = gasket;

    gasket.execApplySync('init', function (plugin, handler) {
      if (imported.includes(plugin)) {
        handler();
      } else {
        tracer.trace(dedupeMsg);
      }
    });

    gasket.execApplySync('configure', function (plugin, handler) {
      if (imported.includes(plugin)) {
        config = handler(config);
      } else {
        tracer.trace(dedupeMsg);
      }
    });

    await gasket.execApply('prepare', async function (plugin, handler) {
      if (imported.includes(plugin)) {
        config = await handler(config);
      } else {
        tracer.trace(dedupeMsg);
      }
    });

    return config;
  }
};
