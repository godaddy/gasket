import { describe, it, expect } from 'vitest';
import type { RequestLike } from '@gasket/request';
import { makeGasketRequest } from '@gasket/request';
import type { Request as ExpressRequest } from 'express';
import type { FastifyRequest } from 'fastify';

describe('@gasket/request types', () => {
  it('allows Express Request to be assigned to RequestLike', () => {
    const expressReq: ExpressRequest = {} as ExpressRequest;

    const requestLike: RequestLike = expressReq;

    expect(requestLike).toBeDefined();
  });

  it('allows Fastify Request to be assigned to RequestLike', () => {
    const fastifyReq: FastifyRequest = {} as FastifyRequest;

    const requestLike: RequestLike = fastifyReq;

    expect(requestLike).toBeDefined();
  });

  it('allows makeGasketRequest usage with Express Request', () => {
    const expressReq: ExpressRequest = {
      headers: { 'content-type': 'application/json' }
    } as ExpressRequest;

    const gasketRequest = makeGasketRequest(expressReq);

    expect(gasketRequest).toBeDefined();
  });

  it('allows makeGasketRequest usage with Fastify Request', () => {
    const fastifyReq: FastifyRequest = {
      headers: { 'content-type': 'application/json' }
    } as FastifyRequest;

    const gasketRequest = makeGasketRequest(fastifyReq);

    expect(gasketRequest).toBeDefined();
  });
});
