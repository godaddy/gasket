import React from 'react';
import { manifest } from './config';

/** @type {import('./index').GasketIntlContext} */
const defaultContext = {
  locale: manifest.defaultLocale
};

export const GasketIntlContext = React.createContext(defaultContext);
