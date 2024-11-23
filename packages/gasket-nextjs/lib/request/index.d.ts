import type { GasketRequest } from '@gasket/request';

export async function request(
  params?: Record<string, string> | URLSearchParams | Promise<URLSearchParams>
): Promise<GasketRequest>;
