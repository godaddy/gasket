import { Gasket, GasketConfigDefinition } from '@gasket/engine';

declare module '@gasket/engine' {

  export interface GasketActions {}

  export interface GasketConfig {}

  export interface Gasket {
    new (config: GasketConfigDefinition): Gasket
    actions: GasketActions
  }

  export interface HookExecTypes {
    configure(config: GasketConfig): GasketConfig
    actions(): GasketActions
  }
}

export function makeGasket(config: GasketConfigDefinition): Gasket
