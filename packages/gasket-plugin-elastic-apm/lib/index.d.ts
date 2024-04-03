import type { IncomingMessage, ServerResponse } from 'http';
import type { Agent, AgentConfigOptions, Transaction } from 'elastic-apm-node';
import type { MaybeAsync } from '@gasket/engine';

export interface ElasticApmConfig extends AgentConfigOptions {
  /** List of cookie names to filter out */
  sensitiveCookies?: Array<string>
}

declare module '@gasket/engine' {
  export interface GasketConfig {
    elasticAPM?: ElasticApmConfig
  }

  export interface Gasket {
    apm?: Agent;
  }

  export interface HookExecTypes {
    apmTransaction(
      transaction: Transaction,
      details: {
        req: IncomingMessage,
        res: ServerResponse
      }
    ): MaybeAsync<void>
  }
}
