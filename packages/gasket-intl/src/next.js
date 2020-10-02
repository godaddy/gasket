import path from 'path';
import merge from 'lodash.merge';
import { getLocalePath, LOADED, ERROR } from './utils';
import { manifest } from './config';
const { defaultPath } = manifest;

const publicDir = path.dirname(process.env.GASKET_INTL_LOCALES_DIR);

//
// export the React components as a convenience
//
export { withGasketIntl, withLocalesRequired, LocalesRequired } from './react';

async function loadLocaleData(localePath, locale) {
  if (Array.isArray(localePath)) {
    const datas = await Promise.all(localePath.map(p => loadLocaleData(p, locale)));
    return merge(...datas);
  }

  const localeFile = getLocalePath(localePath, locale);
  const diskPath = path.join(publicDir, localeFile);
  let messages;
  let status;
  try {
    messages = require(diskPath);
    status = LOADED;
  } catch (e) {
    console.error(e.message);
    messages = [];
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

export const intlGetStaticProps = (localesPath = defaultPath) => async ctx => {
  const { params: { locale } } = ctx;
  const data = await loadLocaleData(localesPath, locale);

  return {
    props: {
      gasketIntl: data
    }
  };
};

export const intlGetServerSideProps = (localesPath = defaultPath) => async ctx => {
  const { res } = ctx;
  const { locale } = res.gasketData.intl;
  const data = await loadLocaleData(localesPath, locale);

  return {
    props: {
      gasketIntl: data
    }
  };
};
