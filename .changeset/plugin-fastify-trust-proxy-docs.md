---
"@gasket/plugin-fastify": patch
"@gasket/request": patch
---

Document `trustProxy` as a proxy address list instead of `true` throughout examples, since `true` trusts the whole `X-Forwarded-For` chain and lets a client spoof `request.ip`; Fastify 5 treats a hop count as "trust no proxy".
