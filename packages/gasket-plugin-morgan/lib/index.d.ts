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

const plugin: Plugin = {
  name: '@gasket/plugin-morgan',
  hooks: {}
};

export = plugin;
