import type { IncomingMessage, OutgoingMessage } from 'http';
import type { Gasket, GasketConfigFile, Hook } from '@gasket/engine';
import '@gasket/plugin-intl';

describe('@gasket/plugin-intl', () => {
  it('adds intl config to Gasket', () => {
    const config: GasketConfigFile = {
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
    const config: GasketConfigFile = {
      intl: {
        modules: true
      }
    };

    const config2: GasketConfigFile = {
      intl: {
        modules: {
          localesDir: 'locales',
          excludes: ['test']
        }
      }
    };

    const config3: GasketConfigFile = {
      intl: {
        modules: [
          '@site/shared-pkg',
          '@site/other-pkg/i18n'
        ]
      }
    };

    const badConfig: GasketConfigFile = {
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
