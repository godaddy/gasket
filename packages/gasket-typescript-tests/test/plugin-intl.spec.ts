import type { IncomingMessage, OutgoingMessage } from 'http';
import type { Gasket, GasketConfigDefinition, Hook } from '@gasket/engine';
import '@gasket/plugin-intl';

describe('@gasket/plugin-intl', () => {
  it('adds intl config to Gasket', () => {
    const config: GasketConfigDefinition = {
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

  it('module configurations', () => {
    const config: GasketConfigDefinition = {
      intl: {
        modules: true
      }
    };

    const config2: GasketConfigDefinition = {
      intl: {
        modules: {
          localesDir: 'locales',
          excludes: ['test']
        }
      }
    };

    const config3: GasketConfigDefinition = {
      intl: {
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
      { req, res }: { req: IncomingMessage, res: OutgoingMessage }
    ) => {
      return 'fr-FR';
    };
  });

  it('validates intlLocale return types', async () => {
    // @ts-expect-error
    const hook: Hook<'intlLocale'> = (
      gasket: Gasket,
      locale: string,
      { req, res }: { req: IncomingMessage, res: OutgoingMessage }
    ) => {
      return 3;
    };
  });
});
