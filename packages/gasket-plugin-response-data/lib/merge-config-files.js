const path = require('path');
const merge = require('lodash.merge');

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
    let config;
    try {
      config = require(path.resolve(configDir, name));
    } catch (err) {
      if (err.code !== 'MODULE_NOT_FOUND') {
        throw err;
      }
    }

    return merge(result, config);
  }, {});
};
