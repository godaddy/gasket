---
"@gasket/plugin-fastify": patch
"@gasket/plugin-express": patch
"@gasket/plugin-middleware": patch
"@gasket/request": patch
---

Document `trustProxy` as a hop count instead of `true` throughout examples, since `true` trusts the whole `X-Forwarded-For` chain and lets a client spoof `request.ip`.
