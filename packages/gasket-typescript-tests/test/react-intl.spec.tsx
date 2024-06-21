
import type { Gasket } from '@gasket/core';
import { withLocaleRequired, withIntlProvider } from '@gasket/react-intl';


describe('gasket/react-intl', function () {

  describe('withLocaleRequired', function () {
    it('has expected API', function () {
      const gasket: Gasket = {} as Gasket;
      withLocaleRequired(gasket, '/locale');
      withLocaleRequired(gasket, '/locale', {
        loading: 'loading...',
        initialProps: true,
        forwardRef: true
      });
      withLocaleRequired(gasket, (context) => {
        const variant = context?.req?.headers['x-locale-variant'];
        return variant ? '/locale/' + variant : '/locale';
      });
    });
  });

  describe('withIntlProvider', function () {
    it('has expected API', function () {
      withIntlProvider();
    });
  });
});
