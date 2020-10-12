import assume from 'assume';
import proxyquire from 'proxyquire';
import { LocaleUtils } from '@gasket/helper-intl';

const mockConfig = { manifest: require('./fixtures/mock-manifest.json') };

describe('utils', function () {
  let utils;

  beforeEach(function () {
    utils = proxyquire('../src/utils', {
      './config': mockConfig
    });
  });

  it('exports localeUtils instance', function () {
    assume(utils).property('localeUtils');
    assume(utils.localeUtils).instanceOf(LocaleUtils);
  });
});
