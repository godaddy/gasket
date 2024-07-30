import type { FastifyReply } from "fastify";

export default {
  name: '@gasket/plugin-middleware',
  hooks: {}
};

declare module 'fastify' {
  interface FastifyReply {
    locals: object
  }
}
