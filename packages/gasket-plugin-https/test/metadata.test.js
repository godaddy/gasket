import { describe, it, expect } from 'vitest';
import metadata from '../lib/metadata.js';
import * as actions from '../lib/actions.js';

describe('metadata', () => {

  it('has actions metadata', () => {
    const data = metadata({}, {});
    expect(data).toHaveProperty('actions');
    expect(Object.keys(actions).length).toEqual(data.actions.length);
  });

  it('has lifecycles metadata', () => {
    const data = metadata({}, {});
    expect(data).toHaveProperty('lifecycles');
    expect(data.lifecycles.length).toBeGreaterThan(0);
  });

  it('declares an exec method for every lifecycle', () => {
    const data = metadata({}, {});
    const methods = Object.fromEntries(data.lifecycles.map((lifecycle) => [lifecycle.name, lifecycle.method]));
    expect(methods).toEqual({
      preboot: 'exec',
      devProxy: 'execWaterfall',
      serverConfig: 'execWaterfall',
      createServers: 'execWaterfall',
      terminus: 'execWaterfall',
      servers: 'exec',
      healthcheck: 'exec',
      onSendFailureDuringShutdown: 'exec',
      beforeShutdown: 'exec',
      onSignal: 'exec',
      onShutdown: 'exec'
    });
  });

  it('has configurations metadata', () => {
    const data = metadata({}, {});
    expect(data).toHaveProperty('configurations');
    expect(data.configurations.length).toBeGreaterThan(0);
  });
});
