---
"@gasket/plugin-fastify": patch
"@gasket/plugin-express": patch
---

Document `trustProxy` as a hop count instead of `true`, since `true` trusts the whole `X-Forwarded-For` chain and lets a client spoof `request.ip`.
