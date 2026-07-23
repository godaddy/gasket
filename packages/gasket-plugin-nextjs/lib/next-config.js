/// <reference types="@gasket/core" />

/**
 * Under Turbopack (opted into via `makeGasket({ turbopack: true })`),
 * remove this plugin's Webpack callback (Turbopack ignores it) and add
 * `@gasket/core` and `@gasket/plugin-nextjs` to `serverExternalPackages`
 * so Next loads them at runtime from node_modules instead of tracing
 * and bundling them.
 *
 * When `gasket.config.turbopack` is falsy, this hook is a no-op — the
 * default Webpack path is byte-identical.
 *
 * Other Gasket plugins that need Turbopack support should provide their
 * own `nextConfig` hook that self-registers their package (and any
 * server-only dependencies) under `gasket.config.turbopack`.
 * @type {import('@gasket/core').HookHandler<'nextConfig'>}
 */
export default function nextConfig(gasket, config) {
  if (!gasket.config.turbopack) return config;

  const turbopackConfig = { ...config };
  delete turbopackConfig.webpack;

  turbopackConfig.serverExternalPackages = Array.from(new Set([
    ...(config.serverExternalPackages ?? []),
    '@gasket/core',
    '@gasket/plugin-nextjs'
  ]));

  return turbopackConfig;
}
