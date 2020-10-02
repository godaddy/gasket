import assume from 'assume';
import { formatLocalePath } from '../src/utils';

describe('utils', function () {

  describe('formatLocalePath', function () {
    it('adds locale json to root path', function () {
      const results = formatLocalePath('/locales', 'en-US');
      assume(results).equals('/locales/en-US.json');
    });
    it('substitutes $locale in path template', function () {
      const results = formatLocalePath('/locales/$locale/page1.json', 'en-US');
      assume(results).equals('/locales/en-US/page1.json');
    });
    it('substitutes :locale in path template', function () {
      const results = formatLocalePath('/locales/:locale/page1.json', 'en-US');
      assume(results).equals('/locales/en-US/page1.json');
    });
    it('substitutes {locale} in path template', function () {
      const results = formatLocalePath('/locales/{locale}/page1.json', 'en-US');
      assume(results).equals('/locales/en-US/page1.json');
    });
  });
});
