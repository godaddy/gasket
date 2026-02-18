import type { Plugin, MaybeAsync } from '@gasket/core';
import type { Url } from 'url';
import type { Stream } from 'stream';
import ProxyServer from 'http-proxy';

type RequireAtLeastOne<T, Keys extends keyof T = keyof T> =
  Pick<T, Exclude<keyof T, Keys>> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
  }[Keys];

/**
 * http-proxy does not export types.
 * Any Proxy* types have been lifted from @types/http-proxy
 * https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/http-proxy/index.d.ts
 */

interface ProxyTargetDetailed {
  host: string;
  port: number;
  protocol?: string | undefined;
  hostname?: string | undefined;
  socketPath?: string | undefined;
  key?: string | undefined;
  passphrase?: string | undefined;
  pfx?: Buffer | string | undefined;
  cert?: string | undefined;
  ca?: string | undefined;
  ciphers?: string | undefined;
  secureProtocol?: string | undefined;
}

type ProxyTargetUrl = string | Partial<Url>;
type ProxyTarget = ProxyTargetUrl | ProxyTargetDetailed;

interface ProxyServerOptions {
  /** URL string to be parsed with the url module. */
  target?: ProxyTarget | undefined;
  /** URL string to be parsed with the url module. */
  forward?: ProxyTargetUrl | undefined;
  /** Object to be passed to http(s).request. */
  agent?: any;
  /** Object to be passed to https.createServer(). */
  ssl?: any;
  /** If you want to proxy websockets. */
  ws?: boolean | undefined;
  /** Adds x- forward headers. */
  xfwd?: boolean | undefined;
  /** Verify SSL certificate. */
  secure?: boolean | undefined;
  /** Explicitly specify if we are proxying to another proxy. */
  toProxy?: boolean | undefined;
  /** Specify whether you want to prepend the target's path to the proxy path. */
  prependPath?: boolean | undefined;
  /** Specify whether you want to ignore the proxy path of the incoming request. */
  ignorePath?: boolean | undefined;
  /** Local interface string to bind for outgoing connections. */
  localAddress?: string | undefined;
  /** Changes the origin of the host header to the target URL. */
  changeOrigin?: boolean | undefined;
  /** specify whether you want to keep letter case of response header key */
  preserveHeaderKeyCase?: boolean | undefined;
  /** Basic authentication i.e. 'user:password' to compute an Authorization header. */
  auth?: string | undefined;
  /** Rewrites the location hostname on (301 / 302 / 307 / 308) redirects, Default: null. */
  hostRewrite?: string | undefined;
  /** Rewrites the location host/ port on (301 / 302 / 307 / 308) redirects based on requested host/ port.Default: false. */
  autoRewrite?: boolean | undefined;
  /** Rewrites the location protocol on (301 / 302 / 307 / 308) redirects to 'http' or 'https'.Default: null. */
  protocolRewrite?: string | undefined;
  /** rewrites domain of set-cookie headers. */
  cookieDomainRewrite?: false | string | { [oldDomain: string]: string } | undefined;
  /** rewrites path of set-cookie headers. Default: false */
  cookiePathRewrite?: false | string | { [oldPath: string]: string } | undefined;
  /** object with extra headers to be added to target requests. */
  headers?: { [header: string]: string } | undefined;
  /** Timeout (in milliseconds) when proxy receives no response from target. Default: 120000 (2 minutes) */
  proxyTimeout?: number | undefined;
  /** Timeout (in milliseconds) for incoming requests */
  timeout?: number | undefined;
  /** Specify whether you want to follow redirects. Default: false */
  followRedirects?: boolean | undefined;
  /**
   * If set to true, none of the webOutgoing passes are called and it's your responsibility
   * to appropriately return the response by listening and acting on the proxyRes event
   */
  selfHandleResponse?: boolean | undefined;
  /** Buffer */
  buffer?: Stream | undefined;
  /** Explicitly set the method type of the ProxyReq */
  method?: string | undefined;
}

/**
 * Extends the ProxyServerOptions with some additional properties
 * for configuring the HTTPS proxy server.
 */
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
    prebootHttpsProxy(): MaybeAsync<void>;
    httpsProxy(proxyConfig: HttpsProxyConfig): MaybeAsync<HttpsProxyConfig>,
  }

  export interface GasketActions {
    startProxyServer: () => Promise<ProxyServer>;
  }
}

declare const plugin: Plugin;
export default plugin;
