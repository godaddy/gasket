import type {
  ComponentType,
  FunctionComponent,
  PropsWithChildren,
  ReactNode,
  Ref,
  ForwardRefExoticComponent
} from 'react';
import type {
  LocaleFilePath,
  LocaleFileStatus,
  LocaleHandler,
  IntlManager,
  Messages
} from '@gasket/intl';

//
// Shared Types
//

export { LocaleFileStatus };

export interface LocaleFileRequiredProps {
  /** Path(s) containing locale files */
  localeFilePath: LocaleFilePath | LocaleFilePath[];
  /** Optional custom component shown while loading */
  loading?: ReactNode;
  /** @deprecated Use localeFilePath */
  // deprecatedLocalePath?: any;
}

//
// Locale File Loader Component
//

export type LocaleFileRequired = FunctionComponent<PropsWithChildren<LocaleFileRequiredProps>>;

export interface LocaleFileRequiredHOCProps extends LocaleFileRequiredProps {
  forwardedRef?: boolean;
}

export interface WithWrappedComponent {
  WrappedComponent: ComponentType<any>;
}

export type LocaleFileRequiredHOC =
  | (FunctionComponent<LocaleFileRequiredHOCProps> & WithWrappedComponent)
  | (ForwardRefExoticComponent<any> & WithWrappedComponent);

export function withLocaleFileRequired(
  localeFilePath: LocaleFilePath | LocaleFilePath[],
  options?: {
    loading?: ReactNode;
    forwardRef?: boolean;
  }
): (Component: ComponentType<any>) => LocaleFileRequiredHOC;

//
// Intl Context
//

export type IntlContext_load = (...localeFilePaths: LocaleFilePath[]) => void;
export type IntlContext_status = (...localeFilePaths: LocaleFilePath[]) => (typeof LocaleFileStatus)[keyof typeof LocaleFileStatus];

export interface GasketIntlContext {
  load: IntlContext_load;
  getStatus: IntlContext_status;
  messages: Messages;
}

export function makeContext(
  localeHandler: LocaleHandler,
  messages: Messages,
  setMessages: (messages: Messages) => void
): GasketIntlContext;

//
// Hooks
//

/**
 * Hook to get load status of one or more locale files
 * @param {...any} localeFilePath - One or more locale file paths to check
 */
export function useLocaleFile(
  ...localeFilePath: LocaleFilePath[]
): (typeof LocaleFileStatus)[keyof typeof LocaleFileStatus];

/**
 * Hook to get current loaded messages
 */
export function useMessages(): Messages;

//
// Provider HOC
//

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
    /** Optional static locale file paths to pre-render */
    staticLocaleFilePaths?: LocaleFilePath[];
  }
): (
  Component: ComponentType<Partial<MessagesProps>>
) => IntlProviderHOC;

//
// Internal Utilities
//

export function ensureArray(maybeArray: any): any[];
export function needsToLoad(status: LocaleFileStatus): boolean;

//
// Augment React types
//

declare module 'react' {
  interface ForwardRefExoticComponent<P> {
    WrappedComponent?: ComponentType<P>;
  }
}
