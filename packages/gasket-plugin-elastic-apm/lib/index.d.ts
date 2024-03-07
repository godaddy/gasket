import type { IncomingMessage, ServerResponse } from 'http';
import type { Agent, AgentConfigOptions, Transaction } from 'elastic-apm-node';

declare module '@gasket/engine' {
  export interface GasketConfig {
    elasticAPM?: AgentConfigOptions & {
      sensitiveCookies?: Array<string>
    },
  }

  export interface Gasket {
    apm: Agent;
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
