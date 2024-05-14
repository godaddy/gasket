import { Gasket } from '@gasket/engine';

export function gatherManifestData(
  gasket: Gasket,
  context: {
    req?: IncomingMessage & {
      originalUrl?: string;
    };
    res?: OutgoingMessage;
  }
): MaybeAsync<Manifest>;
