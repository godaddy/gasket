import { LocaleStatus, LocaleUtils } from '@gasket/helper-intl';

describe('@gasket/helper-intl', function () {
  const perform = false;

  describe('LocaleUtils', function () {
    it('has expected API', function () {
      const utils: LocaleUtils = new LocaleUtils({
        manifest: {
          localesPath: '/locales',
          defaultLocale: 'en-US',
          paths: {}
        }
      });

      if (perform) {
        const a: string = utils.getLocalePath('/example', 'en');
        const c: string = utils.formatLocalePath('/example', 'en');
        const b: string = utils.pathToUrl('/example');
        const d: string | null = utils.getFallbackLocale('en');
      }
    });

    it('LocaleStatus enum type', function () {
      const loading: string = LocaleStatus.LOADING;
      const loaded: string = LocaleStatus.LOADED;
      const error: string = LocaleStatus.ERROR;
    });
  });
});
