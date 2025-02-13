import type { Plugin, MaybeAsync } from '@gasket/core';
import type { ServerOptions as ProxyServerOptions, Server as ProxyServer } from 'http-proxy';
import type { RequireAtLeastOne } from '@gasket/plugin-https';

interface BaseHttpsProxyConfig extends ProxyServerOptions {
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
    httpsProxy(proxyConfig: HttpsProxyConfig): MaybeAsync<HttpsProxyConfig>,
  }

  export interface GasketActions {
    startProxyServer: () => Promise<ProxyServer>;
  }
}

const plugin: Plugin = {
  name: '@gasket/plugin-plugin-https-proxy',
  hooks: {}
};

export default plugin;
