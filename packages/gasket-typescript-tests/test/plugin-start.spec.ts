import { Gasket, Hook } from "@gasket/engine";
import '@gasket/plugin-start';

describe('@gasket/plugin-start', () => {
  it('creates the build lifecycle', () => {
    const handler: Hook<'build'> = async (gasket: Gasket) => {
      console.log('Generating files...');
    }
  });

  it('creates the preboot lifecycle', () => {
    const handler: Hook<'preboot'> = async (gasket: Gasket) => {
      console.log('Preparing...');
    }
  });

  it('creates the start lifecycle', () => {
    const handler: Hook<'start'> = async (gasket: Gasket) => {
      console.log('Doing stuff...');
    }
  });
});
