import type { IncomingMessage, OutgoingMessage } from 'http';
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
      modules?: boolean | {
        localesDir?: string,
        excludes?: Array<string>
      },
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
    intl: GasketDataIntl
  }
}
