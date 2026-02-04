/* eslint-disable vitest/expect-expect, jest/expect-expect */
import type { Gasket, GasketConfigDefinition, Hook } from '@gasket/core';
import type { NextConfig, NextServer } from '@gasket/plugin-nextjs';
import { Application } from 'express';

describe('@gasket/plugin-nextjs', () => {
  it('adds a nextConfig section to Gasket config', () => {
    const config: GasketConfigDefinition = {
      plugins: [{ name: 'example-plugin', version: '', description: '', hooks: {} }],
      nextConfig: {
        poweredByHeader: false,
        useFileSystemPublicRoutes: false
      }
    };
  });

  it('adds a next lifecycle', () => {
    const handler: Hook<'next'> = (gasket: Gasket, next: NextServer) => {
      next.setAssetPrefix('/public/assets');
    };
  });

  it('adds a nextConfig lifecycle', () => {
    const handler: Hook<'nextConfig'> = (gasket: Gasket, config: NextConfig): NextConfig => {
      return {
        ...config,
        poweredByHeader: false
      };
    };
  });

  it('adds a nextExpress lifecycle', () => {
    const handler: Hook<'nextExpress'> = (
      gasket: Gasket,
      { next, express }: { next: NextServer, express: Application }
    ) => {

    };
  });
});
