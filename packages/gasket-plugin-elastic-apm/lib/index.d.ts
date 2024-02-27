import type { IncomingMessage, ServerResponse } from 'http';
import type { Agent, AgentConfigOptions, Transaction } from 'elastic-apm-node';
import type Log from '@gasket/log';

declare module '@gasket/engine' {
  export interface GasketConfig {
    elasticAPM?: AgentConfigOptions & {
      sensitiveCookies?: Array<string>
    },
  }

  export interface Gasket {
    apm: Agent;
    logger: Log;
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
