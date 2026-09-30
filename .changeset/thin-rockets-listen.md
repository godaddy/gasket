---
"@gasket/template-api-fastify": major
"@gasket/typescript-tests": major
"@gasket/plugin-fastify": major
"@gasket/plugin-swagger": major
"@gasket/plugin-nextjs": major
---

Upgrade to Fastify 5. `@gasket/plugin-fastify` now creates the server through version adapters and accepts `fastify@^4.29.1 || ^5`; `@gasket/template-api-fastify` scaffolds Fastify 5. Apps pinning Fastify 4 plugins should verify Fastify 5 compatibility before upgrading.
