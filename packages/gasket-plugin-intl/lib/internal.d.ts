import { Gasket, GasketRequest } from '@gasket/core';
import { IncomingMessage } from 'http';

/** Get the preferred locale from the request headers. */
function getLocaleFromHeaders(
  gasket: Gasket,
  req: GasketRequest | IncomingMessage,
  locales: string[],
  defaultLocale: string
): string;

/** Get the preferred locale from the request headers. */
function getPreferredLocale(
  gasket: Gasket,
  req: GasketRequest | IncomingMessage,
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
