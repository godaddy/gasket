import { Gasket, GasketConfigDefinition } from '@gasket/engine';

declare module '@gasket/engine' {

  export interface GasketActions {}

  export interface GasketConfig {}

  export interface Gasket {
    new (config: GasketConfigDefinition): Gasket
    actions: GasketActions
  }

  export interface HookExecTypes {
    init(): void
    actions(): GasketActions
    configure(config: GasketConfig): GasketConfig
  }
}

export function makeGasket(config: GasketConfigDefinition): Gasket
