import GasketEngine, { Gasket, GasketConfigDefinition } from '@gasket/engine';

declare module '@gasket/engine' {
  export interface Gasket {
    actions: Record<string, Function>
  }
}

export function makeGasket(config: GasketConfigDefinition): Gasket
