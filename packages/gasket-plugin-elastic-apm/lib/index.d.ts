import type { IncomingMessage, ServerResponse } from 'http';
import type { AgentConfigOptions, Transaction, Payload } from 'elastic-apm-node';
import type { MaybeAsync, GasketConfig } from '@gasket/core';
import type { GasketData } from '@gasket/data';
import type { GasketRequest } from '@gasket/core';

export function filterSensitiveCookies(config: GasketConfig): function(Payload): Payload;

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
    async getApmTransaction(
      req: GasketRequest
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

export default {
  name: '@gasket/plugin-elastic-apm',
  version: '',
  description: '',
  hooks: {}
};
