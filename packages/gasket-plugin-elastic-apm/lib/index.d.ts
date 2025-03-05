import type { AgentConfigOptions, Transaction, Payload, Agent } from 'elastic-apm-node';
import type { GasketConfig, Plugin, MaybeAsync } from '@gasket/core';
import type { RequestLike, GasketRequest } from '@gasket/request';

export function filterSensitiveCookies(config: GasketConfig): (Payload) => Payload;

export interface ExtendedAgentConfigOptions extends AgentConfigOptions {
  sensitiveCookies?: Array<string>;
}

declare module '@gasket/core' {
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

declare const plugin: Plugin;

export default plugin;
