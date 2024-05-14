import type { Compiler, Configuration } from 'webpack';
import { Gasket } from '@gasket/engine';
import type { WebpackMetrics } from '@gasket/plugin-webpack';

export async function handleMetrics(
  /** Metrics data gathered from plugin */
  metrics: WebpackMetrics
): Promise<void>;

/**
 * This plugin will calculate the sizes of the directories from the webpack
 * bundle sent to the browser and call the metrics lifecycle with the data.
 */
export function apply(compiler: Compiler): void;

/** Sets up a context object with special getters */
export function setupContext(
  gasket: Gasket,
  /** Additional context-specific information */
  context: any,
  name: string
): any;

export function deprecatedMerges(
  gasket: Gasket,
  /** Initial webpack config */
  initConfig: Configuration,
  /** Additional context-specific information */
  context: object
): Configuration;
