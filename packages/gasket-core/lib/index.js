const GasketEngine = require('@gasket/engine');

// const initPromises = new WeakMap();

function makeGasket(config) {
  const instance = new GasketEngine(config);
  instance.actions = {};

  instance.config = instance.execWaterfallSync('configure', config);

  const actions = instance.execSync('actions');
  actions.forEach(actionObj => {
    Object.keys(actionObj).forEach(actionName => {
      instance.actions[actionName] = actionObj[actionName].bind(instance);
    });
  });

  // instance.isInit = false;
  // instance.init = async function init() {
  //   if (instance.isInit) {
  //     return instance;
  //   }
  //
  //   let initPromise = initPromises.get(instance);
  //
  //   if (!initPromise) {
  //     initPromise = new Promise((resolve, reject) => {
  //       // https://godaddy-corp.atlassian.net/browse/PFX-551
  //       instance.exec('init').then(async () => {
  //         instance.config = await instance.execWaterfall('configure', config);
  //         instance.isInit = true;
  //         resolve(instance);
  //       }).catch(reject);
  //     });
  //     initPromises.set(instance, initPromise);
  //   }
  //
  //   return initPromise;
  // };


  return instance;
}

module.exports = {
  makeGasket
};
