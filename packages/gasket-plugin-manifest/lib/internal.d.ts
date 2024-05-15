import { Gasket } from '@gasket/core';

export function gatherManifestData(
  gasket: Gasket,
  context: {
    req?: IncomingMessage & {
      originalUrl?: string;
    };
    res?: OutgoingMessage;
  }
): MaybeAsync<Manifest>;
