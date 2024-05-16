import type { IncomingMessage, ServerResponse } from 'http';
import type { AgentConfigOptions, Transaction, Payload } from 'elastic-apm-node';
import type { MaybeAsync, GasketConfig } from '@gasket/core';
import type { GasketData } from '@gasket/data';

export function filterSensitiveCookies(config: GasketConfig): function(Payload): Payload;

interface ExtendedAgentConfigOptions extends AgentConfigOptions {
  sensitiveCookies?: Array<string>;
}

declare module '@gasket/core' {
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
            gasketData: GasketData & {
              locale?: string;
            };
          };
        };
      }
    ): MaybeAsync<void>;
  }
}
