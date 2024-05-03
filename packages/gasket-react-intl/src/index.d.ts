import { PropsWithChildren } from 'react';
import { LocalePathPartOrThunk, LocaleStatus } from '@gasket/helper-intl';

export { LocaleStatus };

/**
 * Make an HOC that adds a provider to managing locale files as well as the
 * react-intl Provider. This can be used to wrap a top level React or a Next.js
 * custom App component.
 */
export function withIntlProvider<Props>(): (
  Component: React.ComponentType<Props>
) => React.ComponentType<Props>;

/**
 * Make an HOC that loads a locale file before rendering wrapped component
 */
export function withLocaleRequired(
  /** Path containing locale files */
  localePathPart?: LocalePathPartOrThunk,
  options?: {
    /** Custom component to show while loading */
    loading?: React.ReactNode;
    /** Preload locales during SSR with Next.js pages */
    initialProps?: boolean;
    forwardRef?: boolean;
  }
): (Component: React.ComponentType<Props>) => React.ComponentType<Props>;

export interface LocaleRequiredProps {
  /** Path containing locale files */
  localesPath: LocalePathPartOrThunk;
  /** Custom component to show while loading */
  loading?: React.Component;
}

/**
 * Component that loads a locale file before rendering children
 */
export function LocaleRequired(
  props: PropsWithChildren<LocaleRequiredProps>
): React.ComponentType<PropsWithChildren<LocaleRequiredProps>> | null;

/**
 * React that fetches a locale file and returns loading status
 */
export function useLocaleRequired(
  /** Path containing locale files */
  localePathPart: LocalePathPartOrThunk
): LocaleStatus;
