---
"@gasket/plugin-https": patch
---

Replace http-proxy with http-proxy-3 in the dev proxy so a Trailer header no longer crashes it, and respond 502 when the target fails or times out
