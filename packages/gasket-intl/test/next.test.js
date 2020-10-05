/* eslint-disable no-console */
import assume from 'assume';
import sinon from 'sinon';
import proxyquire from 'proxyquire';

const mockManifest = require('./fixtures/mock-manifest.json');
const mockConfig = {};

const getNext = () => proxyquire('../src/next', {
  './config': mockConfig
});

describe('next', function () {
  let next, res;

  beforeEach(function () {
    sinon.stub(console, 'error');
    mockConfig.basePath = '';
    mockConfig.defaultLocale = 'en-US';
    mockConfig.manifest = { ...mockManifest, paths: { ...mockManifest.paths } };
    res = {
      gasketData: {
        intl: {
          locale: 'en-US'
        }
      }
    };
    next = getNext();
  });

  afterEach(function (){
    sinon.restore();
  });

  describe('intlGetStaticProps', function () {
    it('makes getStaticProps function', function () {
      const results = next.intlGetStaticProps();
      assume(results).instanceOf(Function);
    });

    it('returns localesProps for default path', async function () {
      const results = await next.intlGetStaticProps()({ params: { locale: 'en-US' } });
      assume(results).eqls({
        props: {
          localesProps: {
            locale: 'en-US',
            messages: { 'en-US': { gasket_welcome: 'Hello!', gasket_learn: 'Learn Gasket' } },
            status: { '/locales/en-US.json': 'loaded' }
          }
        }
      });
    });

    it('returns localesProps for other path part', async function () {
      const results = await next.intlGetStaticProps('/locales/extra')({ params: { locale: 'en-US' } });
      assume(results).eqls({
        props: {
          localesProps: {
            locale: 'en-US',
            messages: { 'en-US': { gasket_extra: 'Extra' } },
            status: { '/locales/extra/en-US.json': 'loaded' }
          }
        }
      });
    });

    it('returns localesProps for multiple locale path parts', async function () {
      const results = await next.intlGetStaticProps(['/locales', '/locales/extra'])({ params: { locale: 'en-US' } });
      assume(results).eqls({
        props: {
          localesProps: {
            locale: 'en-US',
            messages: { 'en-US': { gasket_welcome: 'Hello!', gasket_learn: 'Learn Gasket', gasket_extra: 'Extra' } },
            status: {
              '/locales/en-US.json': 'loaded',
              '/locales/extra/en-US.json': 'loaded'
            }
          }
        }
      });
    });

    it('returns localesProps with error for missing path', async function () {
      const results = await next.intlGetStaticProps('/locales/missing')({ params: { locale: 'en-US' } });
      assume(results).eqls({
        props: {
          localesProps: {
            locale: 'en-US',
            messages: { 'en-US': {} },
            status: { '/locales/missing/en-US.json': 'error' }
          }
        }
      });
      assume(console.error).is.calledWithMatch('Cannot find module');
    });

    it('returns localesProps for default if locale missing', async function () {
      const results = await next.intlGetStaticProps('/locales')({ params: { locale: 'fr-CA' } });
      assume(results).eqls({
        props: {
          localesProps: {
            locale: 'fr-CA',
            messages: { 'fr-CA': { gasket_welcome: 'Hello!', gasket_learn: 'Learn Gasket' } },
            status: { '/locales/en-US.json': 'loaded' }
          }
        }
      });
    });
  });

  describe('intlGetServerSideProps', function () {
    it('makes getServerSideProps function', function () {
      const results = next.intlGetServerSideProps();
      assume(results).instanceOf(Function);
    });

    it('returns localesProps for default path', async function () {
      const results = await next.intlGetServerSideProps()({ res });
      assume(results).eqls({
        props: {
          localesProps: {
            locale: 'en-US',
            messages: { 'en-US': { gasket_welcome: 'Hello!', gasket_learn: 'Learn Gasket' } },
            status: { '/locales/en-US.json': 'loaded' }
          }
        }
      });
    });

    it('returns localesProps for other path part', async function () {
      const results = await next.intlGetServerSideProps('/locales/extra')({ res });
      assume(results).eqls({
        props: {
          localesProps: {
            locale: 'en-US',
            messages: { 'en-US': { gasket_extra: 'Extra' } },
            status: { '/locales/extra/en-US.json': 'loaded' }
          }
        }
      });
    });

    it('returns localesProps for multiple locale path parts', async function () {
      const results = await next.intlGetServerSideProps(['/locales', '/locales/extra'])({ res });
      assume(results).eqls({
        props: {
          localesProps: {
            locale: 'en-US',
            messages: { 'en-US': { gasket_welcome: 'Hello!', gasket_learn: 'Learn Gasket', gasket_extra: 'Extra' } },
            status: {
              '/locales/en-US.json': 'loaded',
              '/locales/extra/en-US.json': 'loaded'
            }
          }
        }
      });
    });

    it('returns localesProps with error for missing path', async function () {
      const results = await next.intlGetServerSideProps('/locales/missing')({ res });
      assume(results).eqls({
        props: {
          localesProps: {
            locale: 'en-US',
            messages: { 'en-US': {} },
            status: { '/locales/missing/en-US.json': 'error' }
          }
        }
      });
      assume(console.error).is.calledWithMatch('Cannot find module');
    });

    it('returns localesProps for default if locale missing', async function () {
      res.gasketData.intl.locale = 'fr-CA';
      const results = await next.intlGetServerSideProps('/locales')({ res });
      assume(results).eqls({
        props: {
          localesProps: {
            locale: 'fr-CA',
            messages: { 'fr-CA': { gasket_welcome: 'Hello!', gasket_learn: 'Learn Gasket' } },
            status: { '/locales/en-US.json': 'loaded' }
          }
        }
      });
    });
  });
});
