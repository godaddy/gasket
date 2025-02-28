import type { MaybeAsync, Plugin } from '@gasket/core';
import type { IntlManager } from '@gasket/intl';
import type { LocaleManifestConfig } from '@gasket/intl';

interface CustomScanSettings {
  /** Lookup dir for module files (default: `locales`) */
  localesDir?: string;
  /** List of modules to ignore */
  excludes?: Array<string>;
}

export interface IntlConfig extends LocaleManifestConfig {
  localesDir?: string;
  managerFilename?: string;
  modules?:
  | boolean
  | CustomScanSettings
  /* specific packages w/ optional subdirectories */
  | string[];
  nextRouting?: boolean;
  manager?: IntlManager;
  experimentalImportAttributes?: boolean;
}

declare module '@gasket/core' {
  import type { RequestLike, GasketRequest } from '@gasket/request';

  export interface GasketConfig {
    intl?: IntlConfig;
  }

  export interface GasketActions {
    getIntlLocale: (req: RequestLike) => MaybeAsync<string>;
    /**
     * Provides access to the Intl manager instance to plugins.
     * Especially useful for plugins that are still CJS.
     */
    async getIntlManager: () => IntlManager;
  }

  export interface HookExecTypes {
    intlLocale(
      locale: string,
      context: { req: GasketRequest }
    ): MaybeAsync<string>;
  }
}

declare module '@gasket/data' {
  export interface GasketData {
    intl?: {
      locale: string;
    };
  }
}

declare module 'create-gasket-app' {
  export interface CreateContext {
    hasGasketIntl?: boolean;
  }
}


declare module '@gasket/plugin-intl' {
  const plugin: Plugin;
  export default plugin;
}
