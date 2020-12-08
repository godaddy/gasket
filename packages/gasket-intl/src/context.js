import React from 'react';
import { manifest } from './config';

export const GasketIntlContext = React.createContext({
  locale: manifest.defaultLocale,
  status: {}
});
