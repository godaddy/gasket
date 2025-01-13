import { Gasket, MaybeAsync } from '@gasket/core';
import type { IncomingMessage, OutgoingMessage } from 'http';
import type { Manifest } from '@gasket/plugin-manifest';

export function gatherManifestData(
  gasket: Gasket,
  context: {
    req?: IncomingMessage & {
      originalUrl?: string;
    };
    res?: OutgoingMessage;
  }
): MaybeAsync<Manifest>;
