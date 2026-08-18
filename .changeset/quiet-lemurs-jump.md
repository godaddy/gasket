---
"@gasket/plugin-docs": patch
"@gasket/plugin-intl": patch
---

Fix `exports["."].require` pointing at a nonexistent `./cjs/index.js` in the published package — the real transpiled CJS entrypoint is `./cjs/index.cjs`. Any CJS consumer doing `require('@gasket/plugin-docs')` or `require('@gasket/plugin-intl')` got `MODULE_NOT_FOUND` unconditionally since the ESM port (7.5.0 / 7.6.0 respectively). Every sibling package (`@gasket/core`, `@gasket/intl`, `@gasket/nextjs`, `@gasket/plugin-webpack`, etc.) already points `require` at `./cjs/index.cjs`, and `@gasket/plugin-intl`'s own `default` condition in the same exports block already had the correct path — this brings `require` in line with it.
