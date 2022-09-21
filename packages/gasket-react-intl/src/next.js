import { localeUtils, getLocalesParentDir } from './utils';
import { manifest } from './config';

/**
 * Load locale file(s) for Next.js static pages
 *
 * @param {LocalePathPart|LocalePathPart[]} localePathPart - Path(s) containing locale files
 * @returns {function({}): Promise<{props: {localesProps: LocalesProps}}>} pageProps
 */
export function intlGetStaticProps(localePathPart = manifest.defaultPath) {
  return async ctx => {
    // provide by next i18n
    let { locale } = ctx;
    // otherwise, check for locale in path params
    if (!locale) {
      locale = ctx.params.locale;
    }

    // eslint-disable-next-line no-process-env
    const localesProps = localeUtils.serverLoadData(localePathPart, locale, getLocalesParentDir(), ctx);

    return {
      props: {
        localesProps
      }
    };
  };
}

/**
 * Load locale file(s) for Next.js static pages
 *
 * @param {LocalePathPart|LocalePathPart[]} localePathPart - Path(s) containing locale files
 * @returns {function({}): Promise<{props: {localesProps: LocalesProps}}>} pageProps
 */
export function intlGetServerSideProps(localePathPart = manifest.defaultPath) {
  return async ctx => {
    const { res } = ctx;
    // provide by next i18n
    let { locale } = ctx;
    // otherwise, check gasketData
    if (!locale && res.locals && res.locals.gasketData && res.locals.gasketData.intl) {
      locale = res.locals.gasketData.intl.locale;
    }
    const localesProps = localeUtils.serverLoadData(localePathPart, locale, getLocalesParentDir(), ctx);

    return {
      props: {
        localesProps
      }
    };
  };
}
