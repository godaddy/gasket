---
"@gasket/plugin-dynamic-plugins": major
"@gasket/plugin-elastic-apm": major
"@gasket/plugin-https-proxy": major
"@gasket/plugin-docusaurus": major
"@gasket/typescript-tests": major
"@gasket/plugin-metadata": major
"@gasket/plugin-analyze": major
"@gasket/plugin-command": major
"@gasket/plugin-express": major
"@gasket/plugin-fastify": major
"@gasket/plugin-swagger": major
"@gasket/plugin-webpack": major
"@gasket/plugin-winston": major
"@gasket/plugin-logger": major
"@gasket/plugin-nextjs": major
"@gasket/plugin-https": major
"@gasket/plugin-data": major
"@gasket/plugin-docs": major
"@gasket/plugin-intl": major
"create-gasket-app": major
"@gasket/request": major
"@gasket/core": major
---

Remove the create-only plugins (`@gasket/plugin-git`, `@gasket/plugin-lint`, `@gasket/plugin-jest`, `@gasket/plugin-mocha`, `@gasket/plugin-cypress`, `@gasket/plugin-typescript`) and the `create`, `prompt`, and `postCreate` lifecycle hooks. Plugins must no longer implement these hooks; project scaffolding now comes from `@gasket/template-*` packages.
