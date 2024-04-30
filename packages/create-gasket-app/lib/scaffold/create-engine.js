// const path = require('path');
const GasketEngine = require('@gasket/engine');
const defaultPlugins = require('../config/default-plugins');

module.exports  = async function createEngine({ dest, presets = [], plugins = [] }) {
  const engineConfig = {
    plugins: {
      presets,
      add: [...defaultPlugins, ...plugins]
    },
    root: dest
  };

  console.log(engineConfig);

  const engine = new GasketEngine([...defaultPlugins, ...plugins]);
  engine.command = { id: 'create' };
  await engine.exec('init');

  return engine;
};
