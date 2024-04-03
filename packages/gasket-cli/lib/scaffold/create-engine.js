const path = require('path');
const PluginEngine = require('@gasket/engine');
const defaultPlugins = require('../config/default-plugins');

module.exports  = async function createEngine({ dest, presets = [], plugins = [] }) {
  const resolveFrom = path.join(dest, 'node_modules');

  const engineConfig = {
    plugins: {
      presets,
      add: [...defaultPlugins, ...plugins]
    },
    root: dest
  };

  const engine = new PluginEngine(engineConfig, { resolveFrom });
  engine.command = { id: 'create' };
  await engine.exec('init');

  return engine;
};
