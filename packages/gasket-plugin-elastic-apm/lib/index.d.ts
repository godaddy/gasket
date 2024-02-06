import type { IncomingMessage, ServerResponse } from 'http';
import type { AgentConfigOptions, Transaction } from 'elastic-apm-node';

declare module '@gasket/engine' {
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
