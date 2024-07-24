import type { IncomingMessage, ServerResponse } from 'http';
import type { AgentConfigOptions, Transaction, Payload } from 'elastic-apm-node';
import type { MaybeAsync, GasketConfig } from '@gasket/core';
import type { GasketData } from '@gasket/data';
import type { GasketRequest } from '@gasket/core';
import type { Request } from 'express';

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
      req: IncomingMessage | Request
    ): Promise<Transaction | void>
  }

  export interface HookExecTypes {
    apmTransaction(
      transaction: Transaction,
      context: {
        req: IncomingMessage | Request;
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
