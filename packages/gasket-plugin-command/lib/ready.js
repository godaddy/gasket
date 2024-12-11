import { gasketBin } from './cli.js';

/** @type {import('@gasket/core').HookHandler<'ready'>} */
async function ready(gasket) {
  gasket.isReady.then(() => {
    gasketBin.parse();
  });
}

export default {
  timing: {
    first: true
  },
  handler: ready
}
