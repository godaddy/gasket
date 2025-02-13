import type { Gasket, MaybeAsync } from '@gasket/core';
import type { Manifest } from '.';
import type { IncomingMessage, OutgoingMessage } from 'http';

export function gatherManifestData(
  gasket: Gasket,
  context: {
    req?: IncomingMessage & {
      originalUrl?: string;
    };
    res?: OutgoingMessage;
  }
): MaybeAsync<Manifest>;
