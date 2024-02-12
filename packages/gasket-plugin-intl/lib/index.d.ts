import type { IncomingMessage, OutgoingMessage } from 'http';
import type { MaybeAsync } from '@gasket/engine';
import { LocalesProps } from '@gasket/helper-intl';

declare module '@gasket/engine' {
  export interface GasketConfig {
    intl?: {
      basePath?: string,
      defaultPath?: string,
      defaultLocale?: string,
      locales?: Array<string>,
      localesMap?: Record<string, string>,
      localesDir?: string,
      manifestFilename?: string,
      serveStatic?: boolean | string,
      modules?:
        /* default scan settings */
        boolean |
        /* custom scan settings */
        {
          localesDir?: string,
          excludes?: Array<string>
        } |
        /* specific packages w/ optional subdirectories */
        string[],
      nextRouting?: boolean
    }
  }

  export interface HookExecTypes {
    intlLocale(
      locale: string,
      context: { req: IncomingMessage, res: OutgoingMessage }
    ): MaybeAsync<string>
  }
}

export interface GasketDataIntl extends LocalesProps {
  /**
   * Include base path if configured
   */
  basePath?: string
}

declare module '@gasket/data' {
  export interface GasketData {
    intl?: GasketDataIntl
  }
}
