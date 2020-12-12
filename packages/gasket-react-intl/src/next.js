import path from 'path';
import { localeUtils } from './utils';
import { manifest } from './config';

// eslint-disable-next-line no-process-env
const localesParentDir = path.dirname(process.env.GASKET_INTL_LOCALES_DIR);

/**
 * Load locale file(s) for Next.js static pages
 *
 * @param {LocalePathPart|LocalePathPart[]} localePathPath - Path(s) containing locale files
 * @returns {function({}): Promise<{props: {localesProps: LocalesProps}}>} pageProps
 */
export function intlGetStaticProps(localePathPath = manifest.defaultPath) {
  return async ctx => {
    const { params: { locale } } = ctx;
    const localesProps = localeUtils.serverLoadData(localePathPath, locale, localesParentDir);

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
 * @param {LocalePathPart|LocalePathPart[]} localePathPath - Path(s) containing locale files
 * @returns {function({}): Promise<{props: {localesProps: LocalesProps}}>} pageProps
 */
export function intlGetServerSideProps(localePathPath = manifest.defaultPath) {
  return async ctx => {
    const { res } = ctx;
    const { locale } = res.locals.gasketData.intl || {};
    const localesProps = localeUtils.serverLoadData(localePathPath, locale, localesParentDir);

    return {
      props: {
        localesProps
      }
    };
  };
}
