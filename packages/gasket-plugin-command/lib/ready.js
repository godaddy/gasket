import { gasketBin } from './cli.js';

/** @type {import('@gasket/core').HookHandler<'ready'>} */
export default async function ready(gasket) {
  if (gasket.config.command) {
    gasketBin.parse();
  }
}
