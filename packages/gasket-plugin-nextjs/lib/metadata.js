/// <reference types="@gasket/plugin-metadata" />

/** @type {import('@gasket/engine').HookHandler<'metadata'>} */
module.exports = function metadataHook(gasket, meta) {
  const { metadata } = gasket;

  const hasExpress = Boolean(
    metadata.plugins.find(
      (pluginData) => pluginData.name === '@gasket/plugin-express'
    )
  );

  const hasFastify = Boolean(
    metadata.plugins.find(
      (pluginData) => pluginData.name === '@gasket/plugin-fastify'
    )
  );

  const data = {
    ...meta,
    guides: [
      {
        name: 'Next.js Routing Guide',
        description: 'Basic and advance routing for Next.js',
        link: 'docs/routing.md'
      },
      {
        name: 'Next.js Deployment Guide',
        description: 'Steps to deploy a Next.js Gasket app',
        link: 'docs/deployment.md'
      },
      {
        name: 'Next.js Redux Guide',
        description: 'Using Redux with Next.js Gasket apps',
        link: 'docs/redux.md'
      }
    ],
    lifecycles: [
      {
        name: 'nextConfig',
        method: 'execWaterfall',
        description: 'Setup the Next.js config',
        link: 'README.md#nextConfig',
        parent: 'express'
      },
      {
        name: 'nextPreHandling',
        method: 'exec',
        description: 'Perform tasks just before Next.js request handling',
        link: 'README.md#nextPreHandling',
        parent: 'express',
        after: 'nextExpress'
      }
    ],
    structures: [
      {
        name: 'pages/',
        description: 'NextJS routing',
        link: 'https://nextjs.org/docs/routing/introduction'
      },
      {
        name: 'public/',
        description: 'NextJS static files',
        link: 'https://nextjs.org/docs/basic-features/static-file-serving'
      }
    ],
    configurations: [
      {
        name: 'nextConfig',
        link: 'README.md#configuration',
        description:
          'Everything that can be configured in `next.config.js` can be added here.',
        type: 'object'
      }
    ]
  };

  if (hasExpress) {
    data.lifecycles.push(
      {
        name: 'next',
        method: 'exec',
        description:
          'Update the Next.js app instance before preparing for Express',
        link: 'README.md#next',
        parent: 'express',
        after: 'nextConfig'
      },
      {
        name: 'nextExpress',
        method: 'exec',
        description: 'Access the prepared Next.js app and Express instance',
        link: 'README.md#nextExpress',
        parent: 'express',
        after: 'next'
      }
    );
  }

  if (hasFastify) {
    data.lifecycles.push(
      {
        name: 'next',
        method: 'exec',
        description:
          'Update the Next.js app instance before preparing for Fastify',
        link: 'README.md#next',
        parent: 'fastify',
        after: 'nextConfig'
      },
      {
        name: 'nextFastify',
        method: 'exec',
        description: 'Access the prepared Next.js app and Fastify instance',
        link: 'README.md#nextFastify',
        parent: 'fastify',
        after: 'next'
      }
    );
  }

  return data;
};
