---
"@gasket/plugin-https": patch
"@gasket/plugin-https-proxy": patch
"@gasket/plugin-webpack": patch
---

Correct lifecycle metadata to match how each lifecycle is executed

- `@gasket/plugin-https`: declare `method` for `preboot` and add the `healthcheck`, `onSendFailureDuringShutdown`, `beforeShutdown`, `onSignal` and `onShutdown` lifecycles
- `@gasket/plugin-https-proxy`: declare `method` for `prebootHttpsProxy`
- `@gasket/plugin-webpack`: remove the nonexistent `initWebpack` lifecycle; `webpackConfig` is invoked from the `getWebpackConfig` action
