import type { IncomingMessage, OutgoingMessage } from 'http';
import type { MaybeAsync } from '@gasket/engine';
import { LocalesProps } from '@gasket/helper-intl';

interface CustomScanSettings {
  localesDir?: string;
  excludes?: Array<string>;
}

interface IntlConfig {
  /** @deprecated use localesMap */
  languageMap?: Record<string, string>;
  /** @deprecated use assetPrefix */
  assetPrefix?: string;
  basePath?: string;
  defaultPath?: string;
  /** @deprecated use defaultLocale */
  defaultLanguage?: string;
  defaultLocale?: string;
  locales?: Array<string>;
  localesMap?: Record<string, string>;
  localesDir?: string;
  manifestFilename?: string;
  serveStatic?: boolean | string;
  /* default scan settings */
  modules?:
    | boolean
    | CustomScanSettings
    /* specific packages w/ optional subdirectories */
    | string[];
  nextRouting?: boolean;
  /** Preloads the locale files from the manifest at startup,
  allowing a faster first response. */
  preloadLocales?: boolean;
}

declare module '@gasket/engine' {
  export interface GasketConfig {
    intl?: IntlConfig;
  }

  export interface HookExecTypes {
    intlLocale(
      locale: string,
      context: { req: IncomingMessage; res: OutgoingMessage }
    ): MaybeAsync<string>;
  }
}

export interface GasketDataIntl extends LocalesProps {
  /** Include base path if configured */
  basePath?: string;
}

declare module '@gasket/data' {
  export interface GasketData {
    intl?: GasketDataIntl;
  }
}

declare module '@gasket/cli' {
  export interface CreateContext {
    hasGasketIntl?: boolean;
  }
}

interface SrcPkgDir {
  pkgName?: string;
  srcDir?: string;
}
