import { withLocaleRequired, withIntlProvider } from '@gasket/react-intl';


describe('gasket/react-intl', function () {

  describe('withLocaleRequired', function () {
    it('has expected API', function () {
      withLocaleRequired('/locale');
      withLocaleRequired('/locale', {
        loading: 'loading...',
        initialProps: true,
        forwardRef: true
      });
    });
  });

  describe('withIntlProvider', function () {
    it('has expected API', function () {
      withIntlProvider();
    });
  });
});
