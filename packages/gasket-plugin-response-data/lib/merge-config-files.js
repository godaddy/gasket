const path = require('path');
const merge = require('lodash.merge');
const { tryRequire } = require('@gasket/utils');

module.exports = function loadConfig(gasket) {
  const { root, env, gasketDataDir = 'gasket-data' } = gasket.config;

  let configChain = ['base'];

  if (env === 'local') {
    configChain = configChain.concat([
      'dev',
      'development',
      'local',
      'local.overrides.json',
      'local.overrides.js'
    ]);
  } else {
    const envSegments = env.split('.');
    for (let i = 1; i <= envSegments.length; i++) {
      configChain.push(envSegments.slice(0, i).join('.'));
    }
  }

  const configDir = path.resolve(root, gasketDataDir);

  return configChain.reduce((result, name) => {
    return merge(result, tryRequire(path.resolve(configDir, name)));
  }, {});
};
