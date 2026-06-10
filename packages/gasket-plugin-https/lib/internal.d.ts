import type { Gasket, ServerOptions } from '@gasket/core';
import type { TerminusOptions } from '@godaddy/terminus';

/**
 * A create-servers failure. Error-like (has `.message`), optionally carrying a
 * per-protocol breakdown whose `.code` distinguishes EADDRINUSE.
 */
export type CreateServersError = Error & {
  http?: { code?: string };
  https?: { code?: string };
  http2?: { code?: string };
};

/**
 * A server config value as it appears on serverOpts: a bare port, a single
 * config object, an array of them, or false/null/undefined when unset.
 */
export type ServerConfigValue =
  | ServerOptions['http']
  | ServerOptions['https']
  | ServerOptions['http2'];

/** Provide port defaults. */
export function getPortFallback(
  /** env property from gasket config */
  env?: string
): number;

/** Get server options from the gasket config. */
export function getRawServerConfig(
  /** Gasket instance */
  gasket: Gasket
): ServerOptions;

/** Check if the supplied errors are a result of the port being in use. */
export function portInUseError(
  /** Errors received from create-servers (single or single-element array) */
  errors: CreateServersError | CreateServersError[]
): boolean;

/** Log the create-servers failure, distinguishing port-in-use from other causes. */
export function logServerError(
  /** Errors received from create-servers */
  errors: CreateServersError,
  /** Server options passed to create-servers */
  serverOpts: ServerOptions,
  /** Gasket logger */
  logger: Gasket['logger']
): void;

/**
 * Resolve a server config's port into a `:NNNN` URL suffix (empty when unset).
 * The number-vs-object branch exists for `http`, which may be a bare port
 * number or a config object. https/http2 are always objects per ServerOptions,
 * so the number branch is a harmless no-op for them — keep it so this stays a
 * single shared formatter for all three.
 */
export function portSuffix(
  /** A single server config value from serverOpts (number port or config object) */
  server: ServerConfigValue
): string;

/**
 * Log the started-server URLs, one line per protocol that was created.
 * http and https/http2 are reported separately because they map to different
 * URL schemes; https and http2 share the `https://` scheme.
 */
export function logServersStarted(
  /** Server options passed to create-servers */
  serverOpts: ServerOptions,
  /** Gasket logger */
  logger: Gasket['logger']
): void;

/**
 * Build the shared terminus options object used for every created server.
 *
 * It's possible that we are creating multiple servers that are going to hook
 * into terminus. We want to eliminate the possibility of double lifecycle
 * execution so we create a single options object used for all terminus-based
 * instances. Lifecycles that could potentially be called multiple times are
 * wrapped with a `one-time` function to ensure the callback only executes once.
 */
export function buildTerminusOptions(
  /** Gasket instance */
  gasket: Gasket,
  /** Gasket logger */
  logger: Gasket['logger'],
  /** Healthcheck route paths */
  routes: string[],
  /** Remaining terminus options to spread in */
  terminusDefaults: TerminusOptions
): TerminusOptions;
