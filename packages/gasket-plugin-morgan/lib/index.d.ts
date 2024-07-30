import type { IncomingMessage, ServerResponse } from 'http';
import type { Options } from 'morgan';

declare module '@gasket/core' {
  export interface GasketConfig {
    morgan?: {
      format?: string;
      options?: Options<IncomingMessage, ServerResponse>;
    };
  }
}

export default {
  name: '@gasket/plugin-morgan',
  version: '',
  description: '',
  hooks: {}
};
