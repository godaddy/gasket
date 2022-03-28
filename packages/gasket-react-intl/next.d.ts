import { LocalePathPart, LocalesProps } from '@gasket/helper-intl';

/**
 * Load locale file(s) for Next.js static pages
 *
 * @param {LocalePathPart|LocalePathPart[]} localePathPart - Path(s) containing locale files
 * @returns {function({}): Promise<{props: {localesProps: LocalesProps}}>} pageProps
 */
export function intlGetStaticProps(localePathPart?: LocalePathPart | LocalePathPart[]): (context: {}) => Promise<{
  props: {
    localesProps: LocalesProps;
  };
}>;

/**
 * Load locale file(s) for Next.js static pages
 *
 * @param {LocalePathPart|LocalePathPart[]} localePathPart - Path(s) containing locale files
 * @returns {function({}): Promise<{props: {localesProps: LocalesProps}}>} pageProps
 */
export function intlGetServerSideProps(localePathPart?: LocalePathPart | LocalePathPart[]): (context: {}) => Promise<{
  props: {
    localesProps: LocalesProps;
  };
}>;
