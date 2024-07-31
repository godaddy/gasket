import { LocaleFilePath, LocaleFileStatus, LocaleHandler, Messages } from '@gasket/intl';

export function ensureArray(maybeArray: any): any[];

export function needsToLoad(status: typeof LocaleFileStatus): boolean;

export type IntlContext_load = (...localeFilePaths: LocaleFilePath[]) => void;
export type IntlContext_status = (...localeFilePaths: LocaleFilePath[]) => typeof LocaleFileStatus;

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
