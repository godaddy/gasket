import type { GasketConfigDefinition } from '@gasket/core';

export function loadGasketConfigDefinition(
  root: string,
  env: string,
  commandId: string,
  configFile?: string
): Promise<GasketConfigDefinition>
