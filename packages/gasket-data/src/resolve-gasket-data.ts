/// <reference types="@gasket/plugin-data" />

import type { Gasket } from '@gasket/core';
import type { RequestLike } from '@gasket/request';
import type { GasketData } from './types';

/**
 * Resolves the Gasket data for the current environment.
 * - In a browser, it reads from a script tag via `gasketData()`.
 * - On the server, it invokes `gasket.actions.getPublicGasketData()`.
 */
export async function resolveGasketData(
  gasket: Gasket,
  req: RequestLike
): Promise<GasketData> {
  let data;

  if (typeof document !== 'undefined') {
    const { gasketData } = await import('./gasket-data');
    data = gasketData();
  } else {
    data = await gasket.actions.getPublicGasketData(req);
  }

  return data;
}
