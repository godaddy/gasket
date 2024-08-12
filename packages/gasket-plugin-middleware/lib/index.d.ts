import type { Plugin } from '@gasket/core';
import type { FastifyReply } from "fastify";

declare module 'fastify' {
  interface FastifyReply {
    locals: object
  }
}

const plugin: Plugin = {
  name: '@gasket/plugin-middleware',
  hooks: {}
};

export = plugin;
