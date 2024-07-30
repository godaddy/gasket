import type { IncomingMessage, OutgoingMessage } from 'http';
import type { Gasket, GasketConfigDefinition, Hook, GasketRequest } from '@gasket/core';
import '@gasket/plugin-intl';

describe('@gasket/plugin-intl', () => {
  it('adds intl config to Gasket', () => {
    const config: GasketConfigDefinition = {
      plugins: [{ name: 'example-plugin', version: '', description: '', hooks: {} }],
      intl: {
        defaultLocale: 'fr-FR',
        locales: ['fr-FR', 'en-US', 'zh-TW', 'zh-CN', 'zh-HK', 'zh-SG'],
        localesMap: {
          'zh-HK': 'zh-TW',
          'zh-SG': 'zh-CN'
        }
      }
    };
  });

  it('validated expected props', () => {
    const config: GasketConfigDefinition = {
      plugins: [{ name: 'example-plugin', version: '', description: '', hooks: {} }],
      // @ts-expect-error - requires locales
      intl: {
        modules: true
      }
    };
  });

  it('module configurations', () => {
    const config: GasketConfigDefinition = {
      plugins: [{ name: 'example-plugin', version: '', description: '', hooks: {} }],
      intl: {
        locales: ['en-US', 'fr-FR'],
        modules: true
      }
    };

    const config2: GasketConfigDefinition = {
      plugins: [{ name: 'example-plugin', version: '', description: '', hooks: {} }],
      intl: {
        locales: ['en-US', 'fr-FR'],
        modules: {
          localesDir: 'locales',
          excludes: ['test']
        }
      }
    };

    const config3: GasketConfigDefinition = {
      plugins: [{ name: 'example-plugin', version: '', description: '', hooks: {} }],
      intl: {
        locales: ['en-US', 'fr-FR'],
        modules: [
          '@site/shared-pkg',
          '@site/other-pkg/i18n'
        ]
      }
    };

    const badConfig: GasketConfigDefinition = {
      intl: {
        // @ts-expect-error
        modules: 12345
      }
    };
  });

  it('adds an intlLocale lifecycle', () => {
    const hook: Hook<'intlLocale'> = (
      gasket: Gasket,
      locale: string,
      { req }: { req: GasketRequest }
    ) => {
      return 'fr-FR';
    };
  });

  it('validates intlLocale return types', async () => {
    // @ts-expect-error
    const hook: Hook<'intlLocale'> = (
      gasket: Gasket,
      locale: string,
      { req }: { req: GasketRequest }
    ) => {
      return 3;
    };
  });
});
