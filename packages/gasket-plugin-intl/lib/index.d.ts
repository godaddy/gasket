import type { MaybeAsync, GasketRequest, Plugin } from '@gasket/core';
import { IntlManager } from '@gasket/intl';
import { LocaleManifestConfig } from '@gasket/intl';

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
  export interface GasketConfig {
    intl?: IntlConfig;
  }

  export interface GasketActions {
    getIntlLocale: (req: GasketRequest) => MaybeAsync<string>;
    /**
     * Provides access to the Intl manager instance to plugins.
     * Especially useful for plugins that are still CJS.
     */
    getIntlManager: () => IntlManager;
  }

  export interface HookExecTypes {
    intlLocale(locale: string, context: { req: GasketRequest }): MaybeAsync<string>;
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

const plugin: Plugin = {
  name: '@gasket/plugin-intl',
  hooks: {}
};

export = plugin;
