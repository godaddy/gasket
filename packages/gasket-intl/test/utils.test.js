import assume from 'assume';
import proxyquire from 'proxyquire';
import { LocaleUtils } from '@gasket/helper-intl';

const mockConfig = { manifest: require('./fixtures/mock-manifest.json') };

const utils = proxyquire('../src/utils', {
  './config': mockConfig
});

describe('utils', function () {
  it('exports localeUtils instance', function () {
    assume(utils).property('localeUtils');
    assume(utils.localeUtils).instanceOf(LocaleUtils);
  });
});
