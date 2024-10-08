import { Gasket, Hook } from '@gasket/core';
import '@gasket/plugin-typescript';

describe('@gasket/plugin-typescript', () => {
  const { log } = console;

  it('creates the create lifecycle', () => {
    const handler: Hook<'create'> = async (gasket: Gasket) => {
      log('Creating...');
    };
  });
});
