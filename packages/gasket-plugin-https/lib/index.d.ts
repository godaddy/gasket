import type { MaybeMultiple, MaybeAsync, Plugin } from '@gasket/core';
import type { SecureContextOptions } from 'tls';
import type { Agent as HttpAgent, Server as HttpServer } from 'http';
import type { Agent as HttpsAgent, Server as HttpsServer } from 'https';
import type { SecureServerOptions, Http2Server } from 'http2';
import type { ServerOptions as ProxyServerOptions } from 'http-proxy';
import type { TerminusOptions, HealthCheckError } from '@godaddy/terminus';

type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
  }[Keys];

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
    key: MaybeMultiple<CertInput>;
    cert: MaybeMultiple<CertInput>;
    ca?: MaybeMultiple<CertInput>;
    ciphers?: MaybeMultiple<string>;
    honorCipherOrder?: boolean;
  };

  type HttpsSettings = CustomHttpsSettings &
    Omit<SecureContextOptions, keyof CustomHttpsSettings | 'secureProtocol' | 'secureOptions'>;

  type Http2Settings = CustomHttpsSettings &
    Omit<SecureServerOptions, keyof CustomHttpsSettings | 'secureProtocol' | 'secureOptions'>;

  interface BaseDevProxyConfig extends ProxyServerOptions {
    protocol?: string;
    /** defaults to 'localhost' */
    hostname?: string;
    /** defaults to 8080 */
    port?: number;
  }

  export type DevProxyConfig = RequireAtLeastOne<BaseDevProxyConfig, 'target' | 'forward'>;

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
    terminus?: TerminusOptions & { healthcheck?: string[] };
    devProxy?: DevProxyConfig;
  }

  export interface GasketActions {
    startServer?: () => Promise<void>;
  }

  type CreatedServers = {
    http?: MaybeMultiple<HttpServer>;
    https?: MaybeMultiple<HttpsServer>;
    http2?: MaybeMultiple<Http2Server>;
  };

  export interface HookExecTypes {
    devProxy(proxyConfig: DevProxyConfig): MaybeAsync<DevProxyConfig>;
    serverConfig(serverConfig: Omit<ServerOptions, 'handler'>): MaybeAsync<ServerOptions>;
    createServers(serverConfig: ServerOptions): MaybeAsync<ServerOptions>;
    servers(servers: CreatedServers): MaybeAsync<void>;
    terminus(opts: TerminusOptions): MaybeAsync<TerminusOptions & { healthcheck?: string[] }>;
    healthcheck(HealthcheckError: typeof HealthCheckError): MaybeAsync<void>;

    onSignal(): MaybeAsync<void>;
    beforeShutdown(): MaybeAsync<void>;
    onSendFailureDuringShutdown(): MaybeAsync<void>;
    onShutdown(): MaybeAsync<void>;
  }
}

const plugin: Plugin = {
  name: '@gasket/plugin-https',
  hooks: {}
};

export = plugin;
