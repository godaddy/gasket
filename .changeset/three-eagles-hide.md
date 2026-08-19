---
"@gasket/plugin-docs-graphs": patch
"@gasket/plugin-happyfeet": patch
"@gasket/plugin-swagger": patch
---

Fix `exports["."].require` (and, for `@gasket/plugin-swagger`, the `"./prompts"` subpath export too) pointing at a nonexistent `./cjs/*.js` path in the published package — the real transpiled CJS entrypoint is `./cjs/*.cjs`. Any CJS consumer got `MODULE_NOT_FOUND` unconditionally. Same bug class and fix as the `@gasket/plugin-docs` / `@gasket/plugin-intl` fix in this PR.
