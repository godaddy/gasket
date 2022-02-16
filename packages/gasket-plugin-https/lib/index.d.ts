import type { MaybeMultiple, MaybeAsync } from '@gasket/engine';
import type { SecureContextOptions } from 'tls';
import type { Server as HttpServer } from 'http';
import type { Server as HttpsServer } from 'https';
import type { SecureServerOptions, Http2Server } from 'http2';
import type { TerminusOptions, HealthCheckError } from '@godaddy/terminus';

declare module '@gasket/engine' {
  type BaseListenerConfig = {
    port?: number,
    host?: string,
    timeout?: number
  }

  type CertInput = string | Buffer;

  type CustomHttpsSettings = {
    root?: string,
    key: MaybeMultiple<CertInput>,
    cert: MaybeMultiple<CertInput>,
    ca?: MaybeMultiple<CertInput>,
    ciphers?: MaybeMultiple<string>,
    honorCipherOrder?: boolean
  };

  type HttpsSettings = 
    & CustomHttpsSettings
    & Omit<
      SecureContextOptions,
      keyof CustomHttpsSettings | 'secureProtocol' | 'secureOptions'
    >;

  type Http2Settings = 
    & CustomHttpsSettings
    & Omit<
      SecureServerOptions,
      keyof CustomHttpsSettings | 'secureProtocol' | 'secureOptions'
    >;  

  interface ServerOptions {
    http?: number | false | null | MaybeMultiple<BaseListenerConfig>,
    https?: MaybeMultiple<BaseListenerConfig & HttpsSettings & {
      sni?: Record<string, HttpsSettings>
    }>,
    http2?: MaybeMultiple<BaseListenerConfig & Http2Settings & {
      sni?: Record<string, HttpsSettings>
    }>,
  }

  export interface GasketConfig extends ServerOptions {
    terminus?: TerminusOptions
  }

  type CreatedServers = {
    http?: MaybeMultiple<HttpServer>,
    https?: MaybeMultiple<HttpsServer>,
    http2?: MaybeMultiple<Http2Server>
  }

  export interface HookExecTypes {
    createServers(serveropts: ServerOptions): MaybeAsync<ServerOptions>,
    servers(servers: CreatedServers): MaybeAsync<void>,
    terminus(opts: TerminusOptions): MaybeAsync<TerminusOptions>,
    healthcheck(HealthcheckError: typeof HealthCheckError): MaybeAsync<void>,

    onSignal(): MaybeAsync<void>,
    beforeShutdown(): MaybeAsync<void>,
    onSendFailureDuringShutdown(): MaybeAsync<void>,
    onShutdown(): MaybeAsync<void>
  }
}
