import { MaybeAsync } from '@gasket/core';
import type { OutgoingMessage } from 'http';


export interface PublicGasketData extends Record<string, any> {
}

export interface GasketData extends Record<string, any> {
  public?: PublicGasketData
}

export type GasketDataDefinition = GasketData & {
  environments?: Record<string, Partial<GasketDataDefinition>>
  commands?: Record<string, Partial<GasketDataDefinition>>
}

declare module '@gasket/core' {
  export interface GasketConfig {
    data?: GasketDataDefinition
  }

  export interface GasketActions {
    getGasketData(): Promise<GasketData>
    getPublicGasketData(req: GasketRequest): Promise<PublicGasketData>
  }

  export interface HookExecTypes {
    gasketData(data: GasketData): MaybeAsync<GasketData>,

    publicGasketData(
      publicData: PublicGasketData,
      context: { req: GasketRequest, res?: OutgoingMessage }
    ): MaybeAsync<PublicGasketData>
  }
}

export default {
  name: '@gasket/plugin-data',
  hooks: {}
};
