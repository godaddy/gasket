import { localeUtils } from './utils';
import { manifest } from './config';

let localesParentDir;
/**
 * Get the parent directory of the locales directory
 * @returns {string} localesParentDir
 */
export function getLocalesParentDir() {
  return (
    localesParentDir ||
    // eslint-disable-next-line no-process-env
    (localesParentDir = require('path').dirname(
      // eslint-disable-next-line no-process-env
      process.env.GASKET_INTL_LOCALES_DIR
    ))
  );
}

/**
 * Load locale file(s) for Next.js static pages
 * @type {import('./index').intlGetStaticProps}
 */
export function intlGetStaticProps(localePathPart = manifest.defaultPath) {
  return async (ctx) => {
    // provide by next i18n
    let { locale } = ctx;
    // otherwise, check for locale in path params
    if (!locale) {
      locale = ctx.params.locale;
    }

    /** @type {import('@gasket/helper-intl').LocalesProps} */
    const localesProps = localeUtils.serverLoadData(
      localePathPart,
      locale,
      getLocalesParentDir(),
      ctx
    );

    return {
      props: {
        localesProps
      }
    };
  };
}

/**
 * Load locale file(s) for Next.js server-side rendered pages
 * @type {import('./index').intlGetServerSideProps}
 */
export function intlGetServerSideProps(localePathPart = manifest.defaultPath) {
  return async (ctx) => {
    const { res } = ctx;
    // provide by next i18n
    let { locale } = ctx;
    // otherwise, check gasketData
    if (
      !locale &&
      res.locals &&
      res.locals.gasketData &&
      res.locals.gasketData.intl
    ) {
      locale = res.locals.gasketData.intl.locale;
    }

    /** @type {import('@gasket/helper-intl').LocalesProps} */
    const localesProps = localeUtils.serverLoadData(
      localePathPart,
      locale,
      getLocalesParentDir(),
      ctx
    );

    return {
      props: {
        localesProps
      }
    };
  };
}
