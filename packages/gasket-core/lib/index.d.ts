import { Gasket, GasketConfigDefinition } from '@gasket/engine';

declare module '@gasket/engine' {

  export interface GasketActions {}

  export interface Gasket {
    actions: GasketActions
  }

  export interface HookExecTypes {
    configure(config: GasketConfig): GasketConfig
  }
}

export function makeGasket(config: GasketConfigDefinition): Gasket
