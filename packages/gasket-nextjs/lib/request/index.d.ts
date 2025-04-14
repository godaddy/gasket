import type { GasketRequest } from '@gasket/request';

export function request(
  params?: Record<string, string> | URLSearchParams | Promise<URLSearchParams>
): Promise<GasketRequest>;
