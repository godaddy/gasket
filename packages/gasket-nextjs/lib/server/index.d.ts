import type { GasketRequest } from '@gasket/core';

/**
 * @param query
 * @deprecated - use async `request` from @gasket/nextjs/request
 */
export function request(query?: Record<string, string> | URLSearchParams): GasketRequest;
