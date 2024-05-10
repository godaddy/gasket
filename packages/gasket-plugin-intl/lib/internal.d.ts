import { Gasket } from '@gasket/engine';

/** Get the preferred locale from the request headers. */
function getPreferredLocale(
  gasket: Gasket,
  req: Request,
  locales: string[],
  defaultLocale: string
): string;

function formatLocale(
  /** Selected accept-language */
  language: string
): string;
