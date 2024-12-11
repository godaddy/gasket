import { gasketBin } from './cli.js';

/** @type {import('@gasket/core').HookHandler<'ready'>} */
export default async function ready(gasket) {
  gasket.isReady.then(() => {
    gasketBin.parse();
  });
}
