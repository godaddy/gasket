import { LocalePathPart, LocaleStatus } from '@gasket/helper-intl';

export { LocaleStatus };

/**
 * Make an HOC that adds a provider to managing locale files as well as the react-intl Provider.
 * This can be used to wrap a top level React or a Next.js custom App component.
 *
 * @returns wrapper
 */
export function withIntlProvider<Props>(): (Component: React.ComponentType<Props>) => React.ComponentType<Props>;

/**
 * Make an HOC that loads a locale file before rendering wrapped component
 *
 * @param localePathPart? - Path containing locale files
 * @param [options.loading=null] - Custom component to show while loading
 * @param [options.forwardRef=false] - Forward refs
 * @param [options] - Options
 * @param [options.initialProps=false] - Preload locales during SSR with Next.js pages
 * @returns wrapper
 */
export function withLocaleRequired<Props>(localePathPart?: LocalePathPart, options?: {
  loading?: React.ReactNode;
  initialProps?: boolean;
  forwardRef?: boolean;
}): (Component: React.ComponentType<Props>) => React.ComponentType<Props>;

/**
 * Component that loads a locale file before rendering children
 *
 * @param props - Props
 * @param props.localesPath - Path containing locale files
 * @param [props.loading] - Custom component to show while loading
 * @returns element
 */
export const LocaleRequired: React.ComponentType<
  PropsWithChildren<{
    localesPath: LocalePathPart;
    loading?: React.ReactNode;
  }>
>;

/**
 * React that fetches a locale file and returns loading status
 *
 * @param localePathPart - Path containing locale files
 * @returns status
 */
export function useLocaleRequired(localePathPart: LocalePathPart): LocaleStatus;
