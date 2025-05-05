import React from 'react';
import { needsToLoad } from './utils.js';
import { LocaleFileStatus } from '@gasket/intl';

/** @type {import('./index.d.ts').GasketIntlContext} */
const defaultContext = {
  getStatus: () => LocaleFileStatus.notLoaded,
  load: () => { },
  messages: {}
};

export const GasketIntlContext = React.createContext(defaultContext);

/** @type {import('./index.d.ts').makeContext} */
export function makeContext(localeHandler, messages, setMessages) {

  /** @type {import('./index.d.ts').IntlContext_load} */
  function load(...localeFilePaths) {
    const status = localeHandler.getStatus(...localeFilePaths);

    if (needsToLoad(status)) {
      void localeHandler
        .load(...localeFilePaths)
        .then(() => {
          setMessages(localeHandler.getAllMessages());
        });
    }
  }

  /** @type {import('./index.d.ts').IntlContext_status} */
  function getStatus(...localeFilePaths) {
    return localeHandler.getStatus(...localeFilePaths);
  }

  return {
    getStatus,
    load,
    messages
  };
}
