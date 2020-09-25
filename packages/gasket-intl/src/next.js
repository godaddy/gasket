import path from 'path';

const LOADING = 1;
const LOADED = 2;
const ERROR = 3;
const EXISTS = 4;


const processEnvLocaleDir = path.join(process.cwd(), 'public');

// TODO: support for loading multiple locale files
// TODO: support for asset prefix and/or basePath
async function loadLocaleData(localePath, locale) {
  const localeFile = `${localePath}/${locale}.json`;
  const diskPath = path.join(processEnvLocaleDir, localeFile);
  const messages = require(diskPath);
  return {
    locale,
    messages: {
      [locale]: {
        ...messages
      }
    },
    files: {
      [localeFile]: LOADED
    }
  };
}

export const intlGetStaticProps = (localesPath = '/locales') => async ctx => {
  const { params: { locale } } = ctx;
  const data = await loadLocaleData(localesPath, locale);

  return {
    props: {
      gasketIntl: data
    }
  };
};

export const intlGetServerSideProps = (localesPath = '/locales') => async ctx => {
  const { req: { gasketIntl } } = ctx;
  const { locale } = gasketIntl;
  const data = await loadLocaleData(localesPath, locale);

  return {
    props: {
      gasketIntl: data
    }
  };
};
