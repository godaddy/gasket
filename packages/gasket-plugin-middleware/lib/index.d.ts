import type { FastifyReply } from "fastify";

export = {
  name: '@gasket/plugin-middleware',
  version: '',
  description: '',
  hooks: {}
};

declare module 'fastify' {
  interface FastifyReply {
    locals: object
  }
}
