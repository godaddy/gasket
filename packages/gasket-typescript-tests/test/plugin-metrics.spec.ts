import type { Gasket, Hook } from '@gasket/engine';
import type { Metrics } from '@gasket/plugin-metrics';

describe('@gasket/plugin-metrics', () => {
  const { log } = console;

  it('adds a metrics lifecycle', () => {
    const hook: Hook<'metrics'> = async (gasket: Gasket, data: Metrics) => {
      log(data);
    };
  });
});
