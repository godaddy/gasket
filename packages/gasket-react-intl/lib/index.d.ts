import {
  ComponentType,
  FunctionComponent,
  PropsWithChildren,
  ReactNode,
  Ref
} from 'react';
import {
  LocaleFilePath,
  LocaleFileStatus,
  IntlManager,
  Messages
} from '@gasket/helper-intl';

export { LocaleFileStatus };

export { GasketIntlContext } from './types';

export interface LocaleFileRequiredProps {
  /** Path containing locale files */
  localeFilePath: LocaleFilePath | LocaleFilePath[];
  /** Custom component to show while loading */
  loading?: ReactNode;
  /** @deprecated use localeFilePath */
}

/**
 * Component that loads a locale file before rendering children
 */
export type LocaleFileRequired = FunctionComponent<PropsWithChildren<LocaleFileRequiredProps>>;

export interface LocaleFileRequiredHOCProps extends LocaleFileRequiredProps {
  forwardedRef?: boolean
}

export type LocaleFileRequiredHOC = FunctionComponent<LocaleFileRequiredHOCProps>;

/**
 * Make an HOC that loads a locale file before rendering wrapped component
 */
export function withLocaleFileRequired(
  /** Path containing locale files */
  localeFilePath: LocaleFilePath | LocaleFilePath[],
  options?: {
    /** Custom component to show while loading */
    loading?: ReactNode;
    forwardRef?: boolean;
  }
): (
  Component: ComponentType<any>
) => LocaleFileRequiredHOC;

/**
 * React that fetches a locale file and returns loading status
 */
export function useLocaleFile(
  /** Path containing locale files */
  ...localeFilePath: LocaleFilePath[]
): typeof LocaleFileStatus;

export function useMessages(): Messages;

export interface ProviderProps {
  locale: string;
  forwardedRef?: Ref<any>;
}

export interface MessagesProps {
  locale: string;
  messages: Record<string, any>;
}

export type IntlProviderHOC = FunctionComponent<PropsWithChildren<ProviderProps>>;

export function withMessagesProvider(
  intlManager: IntlManager,
  options?: {
    /** experimental: render additional static locale files */
    staticLocaleFilePaths?: LocaleFilePath[]
  }
): (
  Component: ComponentType<MessagesProps>
) => IntlProviderHOC;
