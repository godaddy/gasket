import React, { ComponentType, FunctionComponent, PropsWithChildren } from 'react';
import {
  LocaleFilePath,
  LocaleFileStatus,
  IntlManager,
  Messages
} from '@gasket/helper-intl';

export { LocaleFileStatus };

export interface LocaleFileRequiredProps {
  /** Path containing locale files */
  localeFilePath: LocaleFilePath | LocaleFilePath[];
  /** Custom component to show while loading */
  loading?: React.ReactNode;
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
  ...localeFilePath: LocaleFilePath[],
  options?: {
    /** Custom component to show while loading */
    loading?: React.ReactNode;
    forwardRef?: boolean;
  }
): (
  Component: React.ComponentType<any>
) => LocaleFileRequiredHOC;



/**
 * React that fetches a locale file and returns loading status
 */
export function useLocaleFile(
  /** Path containing locale files */
  ...localeFilePath: LocaleFilePath[]
): LocaleFileStatus;

export function useMessages(): Messages;


export interface ProviderProps {
  locale: string;
  forwardedRef?: React.Ref<any>;
}

export interface MessagesProps {
  locale: string;
  messages: Record<string, any>;
}

export type IntlContextLoad = (...localeFilePaths: LocaleFilePath[]) => void;
export type IntlContextStatus = (...localeFilePaths: LocaleFilePath[]) => LocaleFileStatus;
export interface GasketIntlContext {
  load: IntlContextLoad;
  getStatus: IntlContextStatus;
  messages: Messages;
}

export type IntlProviderHOC = FunctionComponent<PropsWithChildren<ProviderProps>>;

export function withMessagesProvider(
  intlManager: IntlManager,
  options: { statics?: LocaleFilePath[] }
): (
  Component: React.ComponentType<MessagesProps>
) => IntlProviderHOC;
