---
"@gasket/core": patch
"@gasket/intl": patch
"@gasket/nextjs": patch
"@gasket/plugin-command": patch
"@gasket/plugin-data": patch
"@gasket/plugin-docusaurus": patch
"@gasket/plugin-dynamic-plugins": patch
"@gasket/plugin-elastic-apm": patch
"@gasket/plugin-express": patch
"@gasket/plugin-https-proxy": patch
"@gasket/plugin-logger": patch
"@gasket/plugin-metadata": patch
"@gasket/plugin-morgan": patch
"@gasket/plugin-nextjs": patch
"@gasket/plugin-vitest": patch
"@gasket/preset-api": patch
"@gasket/preset-nextjs": patch
"@gasket/react-intl": patch
"@gasket/request": patch
"@gasket/utils": patch
---

Remove the `build:watch` script from these 20 packages. Each one's `build` script runs `gasket-cjs`, and `build:watch` was `pnpm run build --watch` — but `gasket-cjs` (a Commander CLI) has no `--watch` support and exits with `error: unknown option '--watch'` on every invocation. The script has never worked since these packages moved to `gasket-cjs`; removing it rather than reintroducing watch mode, since no consumer of `gasket-cjs` currently supports it (tracked in PFX-1184, same root cause fixed for the internal fork's equivalent packages in gdcorp-uxp/gasket#2298).
