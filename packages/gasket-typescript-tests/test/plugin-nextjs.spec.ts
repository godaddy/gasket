import type { Gasket, GasketConfigFile, Hook } from "@gasket/engine";
import type { NextConfig, NextServer } from '@gasket/plugin-nextjs';
import { Application } from "express";

describe('@gasket/plugin-nextjs', () => {
  it('adds a nextConfig section to Gasket config', () => {
    const config: GasketConfigFile = {
      nextConfig: {
        poweredByHeader: false,
        useFileSystemPublicRoutes: false
      }
    }
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
        future: {
          ...config.future,
          webpack5: true
        }
      }
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
