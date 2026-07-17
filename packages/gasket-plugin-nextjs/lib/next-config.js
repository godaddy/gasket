/// <reference types="@gasket/core" />

const GASKET_PLUGIN_NAME = /(^@gasket\/plugin-|^@[\w-]+\/gasket-plugin-)/;
// eslint-disable-next-line no-process-env
const processEnv = process.env;

/**
 * Configure Next.js for Turbopack when explicitly enabled.
 * @type {import('@gasket/core').HookHandler<'nextConfig'>}
 */
export default function nextConfig(gasket, config) {
  if (processEnv.TURBOPACK !== '1') return config;

  const turbopackConfig = { ...config };
  delete turbopackConfig.webpack;

  const pluginNames = (gasket.config.plugins ?? []).flatMap((plugin) => (
    typeof plugin?.name === 'string' && GASKET_PLUGIN_NAME.test(plugin.name)
      ? [plugin.name]
      : []
  ));

  turbopackConfig.serverExternalPackages = Array.from(new Set([
    ...(config.serverExternalPackages ?? []),
    '@gasket/core',
    ...pluginNames
  ]));

  return turbopackConfig;
}
