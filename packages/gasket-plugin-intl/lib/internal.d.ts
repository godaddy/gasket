import { Gasket } from '@gasket/core';

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

/** Tuple of package name and path */
type SrcPkgDir = [string, string];

async function getPackageDirs(
  /** Path to parent directory */
  parentDir: string,
  /** List of full paths */
  dirList?: SrcPkgDir[]
): AsyncGenerator<SrcPkgDir>;

function withLocaleRequired(
  /** Path(s) containing locale files */
  localePathPart: LocalePathPart | LocalePathPart[]
): LocalesProps;
