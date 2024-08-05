/// <reference types="@gasket/plugin-data" />

import { gasketData } from './gasket-data.js';

/** @type {import('.').resolveGasketData} */
export async function resolveGasketData(gasket, req) {
  let data;
  if (typeof document !== 'undefined') {
    data = gasketData();
  } else {
    data = gasket.actions.getPublicGasketData(req);
  }

  return data;
}
