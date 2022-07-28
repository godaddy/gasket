import type { GasketConfigFile } from '@gasket/engine';

export function loadGasketConfigFile(
  root: string,
  env: string,
  commandId: string,
  configFile?: string
): Promise<GasketConfigFile>
