import type { IncomingMessage, ServerResponse } from 'http';
import type { AgentConfigOptions } from 'elastic-apm-node';

declare module '@gasket/engine' {
  export interface GasketConfig {
    elasticAPM?: AgentConfigOptions & {
      sensitiveCookies?: Array<string>
    },
  }

  type RequestDetails = {
    req: IncomingMessage,
    res: ServerResponse
  }

  export interface HookExecTypes {
    transactionName(
      currentName: string,
      details: RequestDetails
    ): MaybeAsync<string>,
    transactionLabels(
      currentLabels: Record<string, string>,
      details: RequestDetails
    ): MaybeAsync<Record<string, string>>,
  }
}
