import type { Gasket } from '@gasket/core';
import type { IncomingMessage } from 'http';
import type { GasketRequest } from '@gasket/request';

/** Get the preferred locale from the request headers. */
export function getLocaleFromHeaders(
  gasket: Gasket,
  req: GasketRequest | IncomingMessage,
  locales: string[],
  defaultLocale: string
): string;

/** Get the preferred locale from the request headers. */
export function getPreferredLocale(
  gasket: Gasket,
  req: GasketRequest | IncomingMessage,
): string;

export function formatLocale(
  /** Selected accept-language */
  language: string
): string;

/** Tuple of package name and path */
type SrcPkgDir = [string, string];

export function getPackageDirs(
  /** Path to parent directory */
  parentDir: string,
  /** List of full paths */
  dirList?: SrcPkgDir[]
): AsyncGenerator<SrcPkgDir>;
