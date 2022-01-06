import type { AgentConfigOptions } from 'elastic-apm-node';

declare module '@gasket/engine' {
  export interface GasketConfig {
    elasticAPM?: AgentConfigOptions & {
      sensitiveCookies?: Array<string>
    },
  }
}
