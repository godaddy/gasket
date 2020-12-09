import React from 'react';

/**
 * State of loaded locale files
 *
 * @typedef {object} LocalesState
 * @property {{string: string}} messages
 * @property {{LocalePath: LocalePathStatus}} status
 */

import { manifest } from './config';

/**
 * Props for a Next.js page containing locale and initial state
 *
 * @typedef {LocalesState} LocalesProps
 * @property {Locale} locale
 */

export const GasketIntlContext = React.createContext({
  locale: manifest.defaultLocale,
  status: {}
});
