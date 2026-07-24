---
"@gasket/plugin-nextjs": minor
---

Add opt-in Turbopack support gated on `gasket.config.turbopack` (set via
`makeGasket({ turbopack: true })`). When enabled, this plugin's `nextConfig`
hook removes its Webpack callback and adds `@gasket/core` and
`@gasket/plugin-nextjs` to Next.js `serverExternalPackages`. Other Gasket
plugins should hook `nextConfig` to self-register additional server externals
under this flag.
