/* eslint-disable vitest/expect-expect, jest/expect-expect */
import type { Gasket, GasketConfig, Hook } from '@gasket/core';
import type { GasketCommandDefinition } from '@gasket/plugin-command';


describe('@gasket/plugin-command', () => {
  it('defines the commands lifecycle', () => {
    const hook: Hook<'commands'> = (gasket: Gasket) => {
      const cmd: GasketCommandDefinition = {
        id: 'my-command',
        description: 'My command',
        action: async () => { }
      };
      return cmd;
    };
  });

  it('validates commands return values', () => {
    // @ts-expect-error
    const hook: Hook<'commands'> = (gasket) => {
      return 123; // This should be a GasketCommandDefinition
    };
  });

  it('defines the configure lifecycle', () => {
    const hook: Hook<'configure'> = (gasket: Gasket, config: GasketConfig) => {
      return config;
    };
  });

});
