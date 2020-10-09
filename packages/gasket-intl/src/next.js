import path from 'path';
import merge from 'lodash.merge';
import { localeUtils, LOADED, ERROR } from './utils';
import { manifest } from './config';

// eslint-disable-next-line no-process-env
const publicDir = path.dirname(process.env.GASKET_INTL_LOCALES_DIR);

/**
 * Load locale file(s) are returns localesProps for rendering Next.js pages
 *
 * @param {LocalePathPart|LocalePathPart[]} localePathPath - Path(s) containing locale files
 * @param {Locale} locale - Locale to load
 * @returns {Promise<LocalesProps>} localesProps
 */
async function loadLocaleData(localePathPath, locale) {
  if (Array.isArray(localePathPath)) {
    const localesProps = await Promise.all(localePathPath.map(p => loadLocaleData(p, locale)));
    return merge(...localesProps);
  }

  const localeFile = localeUtils.getLocalePath(localePathPath, locale);
  const diskPath = path.join(publicDir, localeFile);
  let messages;
  let status;

  try {
    messages = require(diskPath);
    status = LOADED;
  } catch (e) {
    console.error(e.message); // eslint-disable-line no-console
    messages = {};
    status = ERROR;
  }

  return {
    locale,
    messages: {
      [locale]: {
        ...messages
      }
    },
    status: {
      [localeFile]: status
    }
  };
}

/**
 * Load locale file(s) for Next.js static pages
 *
 * @param {LocalePathPart|LocalePathPart[]} localesPath - Path(s) containing locale files
 * @returns {function({}): Promise<{props: {localesProps: LocalesProps}}>} pageProps
 */
export function intlGetStaticProps(localesPath = manifest.localesPath) {
  return async ctx => {
    const { params: { locale } } = ctx;
    const localesProps = await loadLocaleData(localesPath, locale);

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
 * @param {LocalePathPart|LocalePathPart[]} localesPath - Path(s) containing locale files
 * @returns {function({}): Promise<{props: {localesProps: LocalesProps}}>} pageProps
 */
export function intlGetServerSideProps(localesPath = manifest.localesPath) {
  return async ctx => {
    const { res } = ctx;
    const { locale } = res.gasketData.intl;
    const localesProps = await loadLocaleData(localesPath, locale);

    return {
      props: {
        localesProps
      }
    };
  };
}
