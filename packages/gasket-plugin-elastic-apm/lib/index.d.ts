import type { IncomingMessage, ServerResponse } from 'http';
import type { Agent, AgentConfigOptions, Transaction, Payload } from 'elastic-apm-node';
import type { MaybeAsync, GasketConfig } from '@gasket/engine';
import type { GasketData } from '@gasket/data';

export function filterSensitiveCookies(config: GasketConfig): function(Payload): Payload;

interface ExtendedAgentConfigOptions extends AgentConfigOptions {
  sensitiveCookies?: Array<string>;
}

declare module '@gasket/engine' {
  export interface GasketConfig {
    elasticAPM?: ExtendedAgentConfigOptions;
  }

  export interface Gasket {
    apm?: Agent;
  }

  export interface HookExecTypes {
    apmTransaction(
      transaction: Transaction,
      details: {
        req: IncomingMessage;
        res: ServerResponse & {
          locals?: {
            gasketData: GasketData;
          };
        };
      }
    ): MaybeAsync<void>;
  }
}