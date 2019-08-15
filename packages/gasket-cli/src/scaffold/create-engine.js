const path = require('path');
const PluginEngine = require('@gasket/plugin-engine');

const defaultPlugins = [
  require('@gasket/git-plugin'),
  require('@gasket/metadata-plugin')
];

module.exports  = function createEngine({ dest, presets = [], plugins = [] }) {
  const resolveFrom = path.join(dest, 'node_modules');

  const engineConfig = {
    plugins: {
      presets,
      add: [...defaultPlugins, ...plugins]
    }
  };

  return new PluginEngine(engineConfig, { resolveFrom });
};
