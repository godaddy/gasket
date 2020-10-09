import { basePath, manifest } from './config';
import { LocaleUtils } from '@gasket/helper-intl';

export const localeUtils = new LocaleUtils({ manifest, basePath });

/**
 * Fetch status of a locale file
 * @typedef {string} LocalePathStatus
 * @readonly
 */

/** @type {LocalePathStatus} */
export const LOADING = 'loading';
/** @type {LocalePathStatus} */
export const LOADED = 'loaded';
/** @type {LocalePathStatus} */
export const ERROR = 'error';
