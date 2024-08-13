import { MaybeAsync, Plugin } from '@gasket/core';

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
      context: { req: GasketRequest }
    ): MaybeAsync<PublicGasketData>
  }
}

declare module 'create-gasket-app' {
  export interface CreateContext {
    typescript: boolean;
    nextServerType: 'appRouter' | 'pageRouter' | 'customServer';
    apiApp: boolean;
  }
}

const plugin: Plugin = {
  name: '@gasket/plugin-data',
  hooks: {}
};

export = plugin;
