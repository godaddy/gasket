import type { Plugin, MaybeAsync } from '@gasket/core';
import type { ServerOptions as ProxyServerOptions } from 'http-proxy';
import ProxyServer from 'http-proxy';
import type { RequireAtLeastOne } from '@gasket/plugin-https';

interface BaseHttpsProxyConfig extends ProxyServerOptions {
  protocol?: string;
  /** defaults to 'localhost' */
  hostname?: string;
  /** defaults to 8080 */
  port?: number;
  target?: string;
  forward?: string;
}

declare module '@gasket/core' {
  export type HttpsProxyConfig = RequireAtLeastOne<BaseHttpsProxyConfig, 'target' | 'forward'>;

  export interface GasketConfig {
    httpsProxy?: HttpsProxyConfig
  }

  export interface HookExecTypes {
    httpsProxy(proxyConfig: HttpsProxyConfig): MaybeAsync<HttpsProxyConfig>,
  }

  export interface GasketActions {
    startProxyServer: () => Promise<ProxyServer>;
  }
}

declare const plugin: Plugin;
export default plugin;
