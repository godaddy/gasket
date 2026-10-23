import type { Compiler } from 'webpack';
import type { WebpackMetrics } from './index';

export function handleMetrics(
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
  context: object
): object & { webpack: any };
