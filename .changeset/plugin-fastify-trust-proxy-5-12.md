---
"@gasket/plugin-fastify": patch
"@gasket/request": patch
---

Correct the `trustProxy` guidance for Fastify 5.12.1, which makes a hop count trust no proxy and drops `number` from the type, and recommend an address list for Express `trust proxy` too.
