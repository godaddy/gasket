import type { AgentConfigOptions, Transaction, Payload, Agent } from 'elastic-apm-node';
import type { GasketConfig, Plugin } from '@gasket/core';

export function filterSensitiveCookies(config: GasketConfig): function(Payload): Payload;

export interface ExtendedAgentConfigOptions extends AgentConfigOptions {
  sensitiveCookies?: Array<string>;
}

declare module '@gasket/core' {
  import { RequestLike, GasketRequest } from '@gasket/request';

  export interface GasketConfig {
    elasticAPM?: ExtendedAgentConfigOptions;
  }

  export interface Gasket {
    apm?: Agent;
  }

  export interface GasketActions {
    getApmTransaction(
      req: RequestLike
    ): Promise<Transaction | void>
  }

  export interface HookExecTypes {
    apmTransaction(
      transaction: Transaction,
      context: {
        req: GasketRequest;
      }
    ): MaybeAsync<void>;
  }
}

const plugin: Plugin = {
  name: '@gasket/plugin-elastic-apm',
  hooks: {}
};

export = plugin;
