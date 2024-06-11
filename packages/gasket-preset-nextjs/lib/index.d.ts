import '@gasket/plugin-express';
import '@gasket/plugin-https';
import '@gasket/plugin-nextjs';
import '@gasket/plugin-redux';
import '@gasket/plugin-start';
import '@gasket/plugin-webpack';
import '@gasket/plugin-winston';


declare module 'create-gasket-app' {
  export interface CreateContext {
    server: 'express' | 'fastify' | 'customServer';
  }
}
