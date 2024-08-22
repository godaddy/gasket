import type { GasketRequest } from '@gasket/core';

export function request(query?: Record<string, string> | URLSearchParams): GasketRequest;
