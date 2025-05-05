/// <reference types="@gasket/plugin-data" />

import { gasketData } from './gasket-data.js';

/** @type {import('./index.d.ts').resolveGasketData} */
export async function resolveGasketData(gasket, req) {
  let data;
  if (typeof document !== 'undefined') {
    data = gasketData();
  } else {
    // Server-side: req may be RequestLike or IncomingMessage.
    // getPublicGasketData expects RequestLike, so we cast here.
    data = await gasket.actions.getPublicGasketData(
      /** @type {import('@gasket/request').RequestLike} */(req)
    );
  }
  return data;
}
