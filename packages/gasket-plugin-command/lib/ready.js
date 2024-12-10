import { gasketBin } from './cli.js';

async function ready(gasket) {
  await gasket.isReady;
  gasketBin.parse();
}

export default ready;
