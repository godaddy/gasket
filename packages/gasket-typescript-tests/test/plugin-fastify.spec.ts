/* eslint-disable vitest/expect-expect */
import type { GasketConfigDefinition } from '@gasket/core';
import '@gasket/plugin-fastify';

describe('@gasket/plugin-fastify', () => {
  const plugins = [{ name: 'example-plugin', version: '', description: '', hooks: {} }];

  it('accepts proxy addresses for trustProxy', () => {
    const list: GasketConfigDefinition = { plugins, fastify: { trustProxy: ['10.0.0.0/8', '127.0.0.1'] } };
    const csv: GasketConfigDefinition = { plugins, fastify: { trustProxy: '10.0.0.0/8, 127.0.0.1' } };
  });

  it('accepts a trust function for trustProxy', () => {
    const config: GasketConfigDefinition = {
      plugins,
      fastify: {
        trustProxy: (address: string, hop: number) => address === '10.0.0.1' && hop === 0
      }
    };
  });

  it('accepts a boolean for trustProxy', () => {
    const config: GasketConfigDefinition = { plugins, fastify: { trustProxy: false } };
  });

  it('rejects a hop count for trustProxy', () => {
    // Fastify 5.12.1+ drops number from the type and trusts no proxy at runtime
    // @ts-expect-error
    const config: GasketConfigDefinition = { plugins, fastify: { trustProxy: 1 } };
  });

  it('accepts disableRequestLogging', () => {
    const config: GasketConfigDefinition = { plugins, fastify: { disableRequestLogging: false } };
  });
});
