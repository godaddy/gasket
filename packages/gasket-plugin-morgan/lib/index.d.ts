import type { Plugin } from '@gasket/core';
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

declare const plugin: Plugin;

export default plugin;
