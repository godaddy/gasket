import type { IncomingMessage, ServerResponse } from 'http';
import type { AgentConfigOptions, Transaction } from 'elastic-apm-node';
import type { MaybeAsync } from '@gasket/core';

declare module '@gasket/core' {
  export interface GasketConfig {
    elasticAPM?: AgentConfigOptions & {
      sensitiveCookies?: Array<string>
    },
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
