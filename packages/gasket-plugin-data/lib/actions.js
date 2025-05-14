/// <reference types="@gasket/core" />

const deepClone = json => JSON.parse(JSON.stringify(json));

const baseDataMap = new WeakMap();
const adjustedDataMap = new WeakMap();

/** @type {import('@gasket/core', { with: { "resolution-mode": "import" } }).ActionHandler<'getGasketData'>} */
async function getGasketData(gasket) {
  const key = gasket.symbol;
  if (!adjustedDataMap.has(key)) {
    const baseData = baseDataMap.get(key) ?? {};
    const adjustedData = await gasket.execWaterfall('gasketData', deepClone(baseData));

    if (!adjustedData) {
      throw new Error(
        'No gasketData - likely a gasketData lifecycle hook did not properly return data.'
      );
    }

    adjustedDataMap.set(key, adjustedData);
    baseDataMap.delete(key);
  }

  return adjustedDataMap.get(key);
}

/** @type {import('@gasket/core', { with: { "resolution-mode": "import" } }).ActionHandler<'getPublicGasketData'>} */
async function getPublicGasketData(gasket, req) {
  const basePublicData = (await gasket.actions.getGasketData()).public ?? {};

  const userPublicData = await gasket.execWaterfall(
    'publicGasketData',
    deepClone(basePublicData),
    { req }
  );

  if (!userPublicData) {
    throw new Error(
      'No public gasketData - likely a publicGasketData lifecycle hook did not properly return data.'
    );
  }

  return userPublicData;
}

// Export the base functions for testing
module.exports = {
  baseDataMap,
  actions: {
    getGasketData,
    getPublicGasketData
  }
};
