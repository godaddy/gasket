import type { GasketConfig } from '@gasket/engine';
import type { IncomingMessage, ServerResponse } from 'http';
import type { Options } from 'morgan';

declare module '@gasket/engine' {
  export interface GasketConfig {
    morgan?: {
      format?: string;
      options?: Options<IncomingMessage, ServerResponse>;
    };
  }
}

export declare const dependencies: string[];

export declare namespace hooks {
    namespace middleware {
        function handler(gasket: GasketConfig): ((req: IncomingMessage, res: ServerResponse, next: (err?: Error) => void) => void)[];
    }
}
