---
"@gasket/plugin-service-worker": patch
---

Replace `webpack-inject-plugin` with an inline loader, dropping the vulnerable `loader-utils@1.2.3` (CVE-2022-37601). On webpack 5, named `webpackRegister` entries are now injected, and `dependOn` is left untouched.
