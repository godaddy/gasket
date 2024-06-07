import React, { PropsWithChildren } from 'react';
import {
  LocalePathPartOrThunk,
  LocaleStatus,
  LocalesProps,
  LocalesState
} from '@gasket/helper-intl';
import type { GasketData } from '@gasket/data';
import type { IncomingMessage, ServerResponse } from 'http';

export { LocaleStatus };

/** Wrapper component which sets up providers and reducer hook */
export type IntlProviderWrapper = (props: {
  /** Component props from a Next.js page */
  pageProps?: {
    /** Initial state from a Next.js page */
    localesProps?: LocalesProps;
  };
}) => React.ReactNode<Props>;

/**
 * Make an HOC that adds a provider to managing locale files as well as the
 * react-intl Provider. This can be used to wrap a top level React or a Next.js
 * custom App component.
 */
export function withIntlProvider<Props>(): (
  Component: React.ComponentType<Props>
) => IntlProviderWrapper<Props>;

export type LocaleRequiredWrapper = (props: {
  forwardedRef?: React.Ref<any>;
  localePathPart?: LocalePathPartOrThunk;
}) => React.ReactNode<Props>;

/**
 * Make an HOC that loads a locale file before rendering wrapped component
 */
export function withLocaleRequired<Props>(
  /** Path containing locale files */
  localePathPart?: LocalePathPartOrThunk | LocalePathPartOrThunk[],
  options?: {
    /** Custom component to show while loading */
    loading?: React.ReactNode;
    /** Preload locales during SSR with Next.js pages */
    initialProps?: boolean;
    forwardRef?: boolean;
  }
): (Component: React.ComponentType<Props>) => LocaleRequiredWrapper<Props>;

export interface LocaleRequiredProps {
  /** Path containing locale files */
  localesPath: LocalePathPartOrThunk | LocalePathPartOrThunk[];
  /** Custom component to show while loading */
  loading?: React.ReactNode;
}

/**
 * Component that loads a locale file before rendering children
 */
export function LocaleRequired(
  props: PropsWithChildren<LocaleRequiredProps>
): React.ReactNode;

/**
 * React that fetches a locale file and returns loading status
 */
export function useLocaleRequired(
  /** Path containing locale files */
  localePathPart: LocalePathPartOrThunk | LocalePathPartOrThunk[]
): LocaleStatus;

interface NextStaticContext extends Record<string, any> {
  locale?: string;
  params: Record<string, string>;
}

interface NextServerContext extends NextStaticContext {
  res: ServerResponse<IncomingMessage> & {
    locals: {
      gasketData: GasketData;
    };
  };
}

interface NextInitialContext extends NextStaticContext {
  res?: ServerResponse<IncomingMessage> & {
    locals: {
      gasketData: GasketData;
      localesDir: string;
    };
  };
}

/** Load locale file(s) for Next.js static pages */
export function intlGetStaticProps(
  /** Path(s) containing locale files */
  localePathPart?: LocalePathPartOrThunk | LocalePathPartOrThunk[]
): (
  ctx: NextStaticContext
) => Promise<{ props: { localesProps: LocalesProps } }>;

/** Load locale file(s) for Next.js server-side rendered pages */
export function intlGetServerSideProps(
  /** Path(s) containing locale files */
  localePathPart?: LocalePathPartOrThunk | LocalePathPartOrThunk[]
): (
  ctx: NextServerContext
) => Promise<{ props: { localesProps: LocalesProps } }>;

declare module '@gasket/data' {
  export interface GasketData {
    intl?: LocalesProps & {
      /** Path to where locale files exist */
      basePath?: string;
    };
  }
}

export interface GasketIntlContext {
  locale: string;
  status?: LocaleStatus;
  dispatch?: React.Dispatch<{
    type: string;
    payload: {};
  }>;
}

/** Merges any initial state from render with that from page props */
export function init(localesProps: LocalesProps): LocalesState;

/** Reducer for managing locale file loading status and messages */
export function reducer(
  /** Incoming State */
  state: LocalesState,
  /** State change action */
  action: {
    type: string;
    payload: Record<string, any>;
  }
): LocalesState;

export function attachGetInitialProps(
  /** The HOC */
  Wrapper: React.ComponentType<any> & {
    WrappedComponent?: React.ComponentType<any> & {
      getInitialProps?: (ctx: NextInitialContext) => Promise<void>;
    };
  },
  /** Path containing locale files */
  localePathPart: LocalePathPartOrThunk | LocalePathPartOrThunk[],
): void;

export async function attachedGetInitialProps(
  ctx: NextInitialContext
): Promise<{
  localePathPart?: LocalePathPartOrThunk;
  localesProps?: LocalesProps;
}>;
