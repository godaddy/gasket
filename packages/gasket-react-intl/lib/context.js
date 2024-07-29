import React from 'react';
import { needsToLoad } from './utils.js';

/** @type {import('./types').GasketIntlContext} */
const defaultContext = {
  getStatus: () => 'not-loaded',
  load: () => {},
  messages: {}
};

export const GasketIntlContext = React.createContext(defaultContext);

/** @type {import('./types').makeContext} */
export function makeContext(localeHandler, messages, setMessages) {

  /** @type {import('./types').IntlContext_load} */
  function load(...localeFilePaths) {
    const status = localeHandler.getStatus(...localeFilePaths);

    if (needsToLoad(status)) {
      void localeHandler.load(...localeFilePaths).then(() => {
        setMessages(localeHandler.getAllMessages());
      });
    }
  }

  /** @type {import('./types').IntlContext_status} */
  function getStatus(...localeFilePaths) {
    return localeHandler.getStatus(...localeFilePaths);
  }

  return {
    getStatus,
    load,
    messages
  };
}
