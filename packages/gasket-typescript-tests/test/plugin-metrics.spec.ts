import type { Gasket, Hook } from "@gasket/engine";
import type { Metrics } from '@gasket/plugin-metrics';

describe('@gasket/plugin-metrics', () => {
  it('adds a metrics lifecycle', () => {
    const hook: Hook<'metrics'> = async (gasket: Gasket, data: Metrics) => {
      console.log(data);
    }
  });
});
