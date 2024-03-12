import type { MaybeMultiple, MaybeAsync } from '@gasket/engine';
import type { SecureContextOptions } from 'tls';
import type { Agent as HttpAgent, Server as HttpServer } from 'http';
import type { Agent as HttpsAgent, Server as HttpsServer } from 'https';
import type { SecureServerOptions, Http2Server } from 'http2';
import type { TerminusOptions, HealthCheckError } from '@godaddy/terminus';

type RequireAtLeastOne<T, Keys extends keyof T = keyof T> =
  Pick<T, Exclude<keyof T, Keys>>
  & {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>
  }[Keys];

declare module '@gasket/engine' {
  type BaseListenerConfig = {
    port?: number,
    host?: string,
    timeout?: number,
    handler?: Function
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

  interface BaseDevProxyConfig {
    target?: {
      host: string;
      port: number;
    };
    forward?: {
      host: string;
      port: number;
    };
    agent?: HttpAgent | HttpsAgent;
    ssl?: {
      key: CertInput;
      cert: CertInput;
      SNICallback: (hostname: string, cb: (err: Error | null, ctx: SecureContextOptions) => void) => void;
    };
    ws?: boolean;
    xfwd?: boolean;
    secure?: boolean;
    toProxy?: boolean;
    prependPath?: boolean;
    ignorePath?: boolean;
    localAddress?: string;
    changeOrigin?: boolean;
    preserveHeaderKeyCase?: boolean;
    auth?: string;
    hostRewrite?: string;
    autoRewrite?: boolean;
    protocolRewrite?: string;
    cookieDomainRewrite?: false | string | { [key: string]: string };
    cookiePathRewrite?: false | string | { [key: string]: string };
    headers?: Record<string, string>;
    proxyTimeout?: number;
    timeout?: number;
    followRedirects?: boolean;
    selfHandleResponse?: boolean;
    buffer?: Buffer;
  }

  type DevProxyConfig = RequireAtLeastOne<BaseDevProxyConfig, 'target' | 'forward'>;

  interface ServerOptions {
    hostname?: string,
    http?: number | false | null | MaybeMultiple<BaseListenerConfig>,
    https?: MaybeMultiple<BaseListenerConfig & HttpsSettings & {
      sni?: Record<string, HttpsSettings>
    }>,
    http2?: MaybeMultiple<BaseListenerConfig & Http2Settings & {
      sni?: Record<string, HttpsSettings>
    }>,
    handler?: Function
  }

  export interface GasketConfig extends ServerOptions {
    terminus?: TerminusOptions
    devProxy?: DevProxyConfig
  }

  type CreatedServers = {
    http?: MaybeMultiple<HttpServer>,
    https?: MaybeMultiple<HttpsServer>,
    http2?: MaybeMultiple<Http2Server>
  }

  export interface HookExecTypes {
    devProxy(proxyConfig: DevProxyConfig): MaybeAsync<DevProxyConfig>,
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
