import type {
  DevProxyConfig,
  MaybeAsync,
  MaybeMultiple,
  Plugin
} from '@gasket/core';
import type { HealthCheckError, TerminusOptions } from '@godaddy/terminus';
import type { Server as HttpServer } from 'http';
import type { Server as HttpsServer } from 'https';
import type { ServerOptions as ProxyServerOptions } from 'http-proxy';
import type { SecureContextOptions } from 'tls';
import type { Http2Server, SecureServerOptions } from 'http2';
import type { Logger } from '@gasket/plugin-logger';

export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> =
  Pick<T, Exclude<keyof T, Keys>> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
  }[Keys];

export function startProxy(opts: DevProxyConfig, logger: Logger): void;

declare module '@gasket/core' {
  type BaseListenerConfig = {
    port?: number;
    host?: string;
    timeout?: number;
    handler?: Function;
  };

  type CertInput = string | Buffer;

  type CustomHttpsSettings = {
    root?: string;
    key?: MaybeMultiple<CertInput>;
    cert?: MaybeMultiple<CertInput>;
    ca?: MaybeMultiple<CertInput>;
    ciphers?: MaybeMultiple<string>;
    honorCipherOrder?: boolean;
  };

  type HttpsSettings = CustomHttpsSettings &
    Omit<
      SecureContextOptions,
      keyof CustomHttpsSettings | 'secureProtocol' | 'secureOptions'
    >;

  type Http2Settings = CustomHttpsSettings &
    Omit<
      SecureServerOptions,
      keyof CustomHttpsSettings | 'secureProtocol' | 'secureOptions'
    >;

  interface BaseDevProxyConfig extends ProxyServerOptions {
    protocol?: string;
    /** defaults to 'localhost' */
    hostname?: string;
    /** defaults to 8080 */
    port?: number;
  }

  export type DevProxyConfig = RequireAtLeastOne<
    BaseDevProxyConfig,
    'target' | 'forward'
  >;

  interface ServerOptions {
    root: string;
    hostname?: string;
    http?: number | false | null | MaybeMultiple<BaseListenerConfig>;
    https?: MaybeMultiple<
      BaseListenerConfig &
      HttpsSettings & {
        sni?: Record<string, HttpsSettings>;
      }
    >;
    http2?: MaybeMultiple<
      BaseListenerConfig &
      Http2Settings & {
        sni?: Record<string, HttpsSettings>;
      }
    >;
    handler?: Function;
  }

  export interface GasketConfig extends ServerOptions {
    devProxy?: DevProxyConfig;
    terminus?: TerminusOptions & { healthcheck?: string[] };
  }

  export interface Actions {
    startServer: () => Promise<void>;
  }

  type CreatedServers = {
    http?: MaybeMultiple<HttpServer>;
    https?: MaybeMultiple<HttpsServer>;
    http2?: MaybeMultiple<Http2Server>;
  };

  export interface HookExecTypes {
    beforeShutdown(): MaybeAsync<void>;
    createServers(serverConfig: ServerOptions): MaybeAsync<ServerOptions>;
    devProxy(proxyConfig: DevProxyConfig): MaybeAsync<DevProxyConfig>;
    healthcheck(errorType: typeof HealthCheckError): MaybeAsync<void>;
    onSendFailureDuringShutdown(): MaybeAsync<void>;
    onShutdown(): MaybeAsync<void>;
    onSignal(): MaybeAsync<void>;
    preboot(): MaybeAsync<void>;
    serverConfig(serverConfig: Omit<ServerOptions, 'handler'>): MaybeAsync<ServerOptions>;
    servers(servers: CreatedServers): MaybeAsync<void>;
    terminus(
      opts: TerminusOptions
    ): MaybeAsync<TerminusOptions & { healthcheck?: string[] }>;
  }
}

declare const plugin: Plugin;

export default plugin;
