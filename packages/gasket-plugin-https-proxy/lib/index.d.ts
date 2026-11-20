import type { Plugin, MaybeAsync } from '@gasket/core';
import type { ProxyServer, ProxyTarget, ServerOptions } from 'http-proxy-3';

type RequireAtLeastOne<T, Keys extends keyof T = keyof T> =
  Pick<T, Exclude<keyof T, Keys>> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
  }[Keys];

/** Object target in the shape http-proxy accepted: every field optional, `port` may be a string. */
type HttpsProxyTargetDetailed = Partial<Omit<Exclude<ProxyTarget, string | URL>, 'port'>> & {
  port?: number | string;
  /** Prepended to the request path. */
  path?: string;
  pathname?: string;
  search?: string;
  /** Ignored by http-proxy-3; use the top-level `auth` option. */
  auth?: string;
};

type HttpsProxyTarget = string | URL | HttpsProxyTargetDetailed;

/**
 * Extends the http-proxy-3 ServerOptions with some additional properties
 * for configuring the HTTPS proxy server.
 */
interface BaseHttpsProxyConfig extends Omit<ServerOptions, 'target' | 'forward'> {
  target?: HttpsProxyTarget | ServerOptions['target'];
  forward?: HttpsProxyTarget;
  protocol?: string;
  /** defaults to 'localhost' */
  hostname?: string;
  /** defaults to 8080 */
  port?: number;
}

declare module '@gasket/core' {
  export type HttpsProxyConfig = RequireAtLeastOne<BaseHttpsProxyConfig, 'target' | 'forward'>;

  export interface GasketConfig {
    httpsProxy?: HttpsProxyConfig
  }

  export interface HookExecTypes {
    prebootHttpsProxy(): MaybeAsync<void>;
    httpsProxy(proxyConfig: HttpsProxyConfig): MaybeAsync<HttpsProxyConfig>,
  }

  export interface GasketActions {
    startProxyServer: () => Promise<ProxyServer>;
  }
}

declare const plugin: Plugin;
export default plugin;
