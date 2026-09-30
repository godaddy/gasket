---
"@gasket/template-nextjs-express": major
"@gasket/template-nextjs-pages": major
"@gasket/template-api-express": major
"@gasket/template-api-fastify": major
"@gasket/template-nextjs-app": major
"@gasket/plugin-elastic-apm": major
"@gasket/typescript-tests": major
"@gasket/plugin-express": major
"@gasket/plugin-fastify": major
"@gasket/plugin-swagger": major
"@gasket/plugin-webpack": major
"@gasket/plugin-morgan": major
"@gasket/plugin-nextjs": major
"@gasket/plugin-data": major
"@gasket/plugin-intl": major
"@gasket/react-intl": major
"@gasket/assets": major
"@gasket/nextjs": major
"@gasket/core": major
"@gasket/data": major
---

Remove `@gasket/plugin-middleware`. Drop it from your plugin list; use the `express` / `fastify` lifecycle hooks from `@gasket/plugin-express` or `@gasket/plugin-fastify` to register middleware.
