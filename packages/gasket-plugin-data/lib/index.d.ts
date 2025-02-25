import type { MaybeAsync, Plugin } from '@gasket/core';

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
  import type { RequestLike, GasketRequest } from '@gasket/request';

  export interface GasketConfig {
    data?: GasketDataDefinition;
  }

  export interface GasketActions {
    getGasketData(): Promise<GasketData>
    getPublicGasketData(req: RequestLike): Promise<PublicGasketData>
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
    nextServerType: 'appRouter' | 'pageRouter' | 'customServer';
  }
}

const plugin: Plugin = {
  name: '@gasket/plugin-data',
  hooks: {}
};

export = plugin;
