import type { GasketRequest } from '@gasket/core';

/**
 * @deprecated - use async `request` from @gasket/nextjs/request
 */
export function request(query?: Record<string, string> | URLSearchParams): GasketRequest;
