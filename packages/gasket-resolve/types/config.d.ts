import type { GasketConfigDefinition } from '@gasket/engine';

export function loadGasketConfigDefinition(
  root: string,
  env: string,
  commandId: string,
  configFile?: string
): Promise<GasketConfigDefinition>
