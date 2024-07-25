import { LocaleFileStatus, LocaleHandler, Messages } from '@gasket/helper-intl';
import { GasketIntlContext } from './index';

export function ensureArray(maybeArray: any): any[];

export function needsToLoad(status: LocaleFileStatus): boolean;

export function makeContext(
  localeHandler: LocaleHandler,
  messages: Messages,
  setMessages: (messages: Messages) => void
): GasketIntlContext;
