import { LocalePathPart, LocaleStatus } from '@gasket/helper-intl';

export { LocaleStatus };

/**
 * Make an HOC that adds a provider to managing locale files as well as the react-intl Provider.
 * This can be used to wrap a top level React or a Next.js custom App component.
 *
 * @returns {function} wrapper
 */
export function withIntlProvider(): Function;

/**
 * Make an HOC that loads a locale file before rendering wrapped component
 *
 * @param {LocalePathPart} localePathPart? - Path containing locale files
 * @param {React.Component} [options?.loading=null] - Custom component to show while loading
 * @param {boolean} [options?.forwardRef=false] - Forward refs
 * @param {object} [options?] - Options
 * @param {boolean} [options?.initialProps=false] - Preload locales during SSR with Next.js pages
 * @returns {function} wrapper
 */
export function withLocaleRequired(localePathPart?: LocalePathPart, options?: {
  loading?: JSX.Element|string;
  initialProps?: boolean;
  forwardRef?: boolean;
}): Function;

/**
 * Component that loads a locale file before rendering children
 *
 * @param {object} props - Props
 * @param {LocalePathPart} props.localesPath - Path containing locale files
 * @param {React.Component} [props.loading] - Custom component to show while loading
 * @returns {JSX.Element|null} element
 */
export function LocaleRequired(props: {
  localesPath: LocalePathPart;
  loading?: JSX.Element|string;
}): JSX.Element | null;

/**
 * React that fetches a locale file and returns loading status
 *
 * @param {LocalePathPart} localePathPart - Path containing locale files
 * @returns {LocaleStatus} status
 */
export function useLocaleRequired(localePathPart: LocalePathPart): LocaleStatus;
