/* eslint-disable no-console */
import { jest } from '@jest/globals';

describe('Next.js functions', function () {
  let next, res;

  beforeEach(function () {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    res = {
      locals: {
        gasketData: {
          intl: {
            locale: 'en-US'
          }
        }
      }
    };
    next = require('../src/next');
  });

  afterEach(function () {
    jest.restoreAllMocks();
  });

  describe('intlGetStaticProps', function () {
    it('makes getStaticProps function', function () {
      const results = next.intlGetStaticProps();
      expect(typeof results).toBe('function');
    });

    it('returns localesProps for default path', async function () {
      const results = await next.intlGetStaticProps('/locales')({ params: { locale: 'en-US' } });
      expect(results).toEqual({
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
      expect(results).toEqual({
        props: {
          localesProps: {
            locale: 'en-US',
            messages: { 'en-US': { gasket_extra: 'Extra' } },
            status: { '/locales/extra/en-US.json': 'loaded' }
          }
        }
      });
    });

    it('handles thunks for locale path part', async function () {
      const mockContext = { params: { locale: 'en-US' }, extra: true };
      const mockThunk = jest.fn().mockImplementation((context) => context.extra ? '/locales/extra' : '/locales');

      const results = await next.intlGetStaticProps(mockThunk)(mockContext);
      expect(mockThunk).toHaveBeenCalledWith(mockContext);
      expect(results).toEqual({
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
      expect(results).toEqual({
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
      const consoleSpy = jest.spyOn(console, 'error');
      const results = await next.intlGetStaticProps('/locales/missing')({ params: { locale: 'en-US' } });
      expect(results).toEqual({
        props: {
          localesProps: {
            locale: 'en-US',
            messages: { 'en-US': {} },
            status: { '/locales/missing/en-US.json': 'error' }
          }
        }
      });
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Cannot find module'));
      consoleSpy.mockRestore();
    });

    it('returns localesProps for default if locale missing', async function () {
      const results = await next.intlGetStaticProps('/locales')({ params: { locale: 'fr-CA' } });
      expect(results).toEqual({
        props: {
          localesProps: {
            locale: 'fr-CA',
            messages: { 'fr-CA': { gasket_welcome: 'Hello!', gasket_learn: 'Learn Gasket' } },
            status: { '/locales/en-US.json': 'loaded' }
          }
        }
      });
    });

    it('uses locale on context from builtin i18n routing', async function () {
      const results = await next.intlGetStaticProps('/locales')({ locale: 'fr-CA' });
      expect(results).toEqual({
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
      expect(typeof results).toBe('function');
    });

    it('returns localesProps for default path', async function () {
      const results = await next.intlGetServerSideProps('/locales')({ res });
      expect(results).toEqual({
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
      expect(results).toEqual({
        props: {
          localesProps: {
            locale: 'en-US',
            messages: { 'en-US': { gasket_extra: 'Extra' } },
            status: { '/locales/extra/en-US.json': 'loaded' }
          }
        }
      });
    });

    it('handles thunks for locale path part', async function () {
      const mockContext = { res, extra: true };
      const mockThunk = jest.fn().mockImplementation((context) => context.extra ? '/locales/extra' : '/locales');

      const results = await next.intlGetServerSideProps(mockThunk)(mockContext);
      expect(mockThunk).toHaveBeenCalledWith(mockContext);
      expect(results).toEqual({
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
      expect(results).toEqual({
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
      const consoleSpy = jest.spyOn(console, 'error');
      const results = await next.intlGetServerSideProps('/locales/missing')({ res });
      expect(results).toEqual({
        props: {
          localesProps: {
            locale: 'en-US',
            messages: { 'en-US': {} },
            status: { '/locales/missing/en-US.json': 'error' }
          }
        }
      });
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Cannot find module'));
      consoleSpy.mockRestore();
    });

    it('returns localesProps for default if locale missing', async function () {
      res.locals.gasketData.intl.locale = 'fr-CA';
      const results = await next.intlGetServerSideProps('/locales')({ res });
      expect(results).toEqual({
        props: {
          localesProps: {
            locale: 'fr-CA',
            messages: { 'fr-CA': { gasket_welcome: 'Hello!', gasket_learn: 'Learn Gasket' } },
            status: { '/locales/en-US.json': 'loaded' }
          }
        }
      });
    });

    it('uses locale on context from builtin i18n routing', async function () {
      const results = await next.intlGetServerSideProps('/locales')({ locale: 'fr-CA', res });
      expect(results).toEqual({
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
