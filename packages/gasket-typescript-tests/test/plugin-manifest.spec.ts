import type { IncomingMessage, OutgoingMessage } from 'http';
import type { Gasket, GasketConfigFile, Hook } from "@gasket/engine";
import type { Manifest } from '@gasket/plugin-manifest';

describe('@gasket/plugin-manifest', () => {
  it('adds a manifest section to Gasket config', () => {
    const config: GasketConfigFile = {
      manifest: {
        short_name: 'PWAwesome',
        name: 'Progressive Web Application',
        path: '/custom/path/manifest.json', // default: /manifest.json
        staticOutput: '/custom/path/manifest.json'
      }
    };

    const config2: GasketConfigFile = {
      manifest: true
    };
  });

  it('adds a manifest lifecycle', () => {
    const handler: Hook<'manifest'> = (
      gasket: Gasket,
      manifest: Manifest,
      { req, res }: { req: IncomingMessage, res: OutgoingMessage }
    ) => {
      return {
        ...manifest,
        path: '/custom/path/manifest.json', // default: /manifest.json
      }
    }

    const fakeGasket = {} as Gasket;
    const initialManifest = {
      short_name: 'your-app',
      name: 'Sample App',
      path: '/manifest.json',
      staticOutput: '/public/manifest.json'
    }

    const justWantToCheckTypes = async () => {
      const manifest: Manifest = await fakeGasket.execWaterfall(
        'manifest',
        initialManifest,
        { req: {} as IncomingMessage, res: {} as OutgoingMessage }
      );  
    }
  });
});
